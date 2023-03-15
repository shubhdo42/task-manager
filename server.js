// Import dependencies
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();

// Set up Express app
const app = express();

// Set up MongoDB connection
mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));
// Define Mongoose schema for task lists
const taskListSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  active: { type: Boolean, default: true },
});

// Define Mongoose schema for tasks
const taskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  dueDate: { type: Date, required: true },
  period: { type: String, required: true },
  periodType: { type: String, enum: ['monthly', 'quarterly', 'yearly'], required: true },
  taskListId: { type: mongoose.Schema.Types.ObjectId, ref: 'TaskList', required: true },
});

// Define Mongoose models for task lists and tasks
const TaskList = mongoose.model('TaskList', taskListSchema);
const Task = mongoose.model('Task', taskSchema);

// Set up Express middleware
app.use(bodyParser.json());

// Define route for creating task lists
app.post('/api/createtasklist', async (req, res) => {
  try {
    const { name, description, active } = req.body;
    const taskList = new TaskList({ name, description, active });
    await taskList.save();
    res.json({ message: 'Task list created successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while creating the task list.' });
  }
});

// Define route for creating tasks
app.post('/api/createtask', async (req, res) => {
  try {
    const { name, description, dueDate, period, periodType, taskListId } = req.body;

    // Validate period and due date
    const periodRegex = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4}$/;
    if (!periodRegex.test(period)) {
      throw new Error('Invalid period format.');
    }
    const periodDate = new Date(period + ' 00:00:00 GMT+0530');
    const dueDateObject = new Date(dueDate);
    if (dueDateObject >= periodDate) {
      console.log(dueDateObject)
      console.log(periodDate)

      throw new Error('Due date must be after end of period.');
    }

    const task = new Task({ name, description, dueDate: dueDateObject, period, periodType, taskListId });
    await task.save();
    res.json({ message: 'Task created successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while creating the task.' });
  }
});

// Define route for listing tasks
app.get('/api/tasklist', async (req, res) => {
  try {
    const { page = 1, limit = 10, searchText = '' } = req.query;
    const skipIndex = (page - 1) * limit;

    // Build MongoDB query for
    const query = searchText ? {
      $or: [
        { name: { $regex: searchText, $options: 'i' } },
        { description: { $regex: searchText, $options: 'i' } },
      ],
    } : {};
    
    // Count total number of tasks that match query
    const totalTasks = await Task.countDocuments(query);
    
    // Get paginated list of tasks that match query
    const tasks = await Task.find(query)
      .populate('taskListId', 'name')
      .sort({ dueDate: 1 })
      .skip(skipIndex)
      .limit(limit);
    
    // Format tasks for response
    const formattedTasks = tasks.map(task => ({
      name: task.name,
      description: task.description,
      periodType: task.periodType,
      period: task.period,
      dueDate: task.dueDate.toLocaleDateString('en-IN'),
      taskListName: task.taskListId.name,
    }));
    
    res.json({ tasks: formattedTasks, totalTasks });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while listing the tasks.' });
    }
    });
    
    // Start server
    app.listen(5000, () => {
    console.log('Server started on port 5000.');
    });
