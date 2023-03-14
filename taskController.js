const moment = require('moment');
const Task = require('./taskModel');

const createTask = async (req, res) => {
  try {
    const { name, description, dueDate, period, periodType, taskListId } = req.body;

    const momentDueDate = moment(dueDate, 'DD-MM-YYYY', true);

    if (!momentDueDate.isValid()) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    const momentPeriod = moment(period, 'MMM YYYY', true);

    if (!momentPeriod.isValid()) {
      return res.status(400).json({ message: 'Invalid period format' });
    }

    if (momentDueDate.isBefore(momentPeriod, 'month')) {
      return res.status(400).json({ message: 'Due date should be after end of period' });
    }

    const task = new Task({
      name,
      description,
      dueDate: momentDueDate.toISOString(),
      period,
      periodType,
      taskListId,
    });

    const savedTask = await task.save();

    res.status(201).json(savedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { createTask };
