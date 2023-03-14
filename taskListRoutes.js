const express = require('express');
const { createTaskList } = require('./taskListController');
const { createTask } = require('./taskController');

const router = express.Router();

router.post('/createtasklist', createTaskList);
router.post('/createtask', createTask);

module.exports = router;
