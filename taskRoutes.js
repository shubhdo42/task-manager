const express = require('express');
const mongoose = require('mongoose');
const moment = require('moment');
const Task = require('./taskModel');

const router = express.Router();

router.get('/tasklist', async (req, res) => {
  try {
    const { page = 1, limit = 10, searchText = '' } = req.query;

    const tasks = await Task.find()
      .populate('taskListId', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const count = await Task.countDocuments();

    const filteredTasks = tasks.filter(task => {
      return task.name.toLowerCase().includes(searchText.toLowerCase())
        || task.description.toLowerCase().includes(searchText.toLowerCase());
    });

    const formattedTasks = filteredTasks.map(task => {
      const momentDueDate = moment(task.dueDate);
      const formattedDueDate = momentDueDate.format('DD-MM-YYYY');
      return {
        name: task.name,
        description: task.description,
        periodType: task.periodType,
        period: task.period,
        dueDate: formattedDueDate,
        taskListName: task.taskListId.name,
      };
    });

    res.json({ tasks: formattedTasks, count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
