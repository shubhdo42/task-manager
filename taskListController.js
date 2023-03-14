const TaskList = require('./taskListModel');

const createTaskList = async (req, res) => {
  try {
    const { name, description, active } = req.body;

    const taskList = new TaskList({
      name,
      description,
      active,
    });

     console.log("attempted")
    const savedTaskList = await taskList.save();

    res.status(201).json(savedTaskList);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { createTaskList };
