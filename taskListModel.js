const mongoose = require('mongoose');

const taskListSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const TaskList = mongoose.model('TaskList', taskListSchema);

module.exports = TaskList;
