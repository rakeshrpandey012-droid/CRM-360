const asyncHandler = require('express-async-handler');
const Task = require('../models/Task');
const Notification = require('../models/Notification');

// @desc    Get tasks with filters
// @route   GET /api/tasks
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
  const query = {};

  if (req.query.status && req.query.status !== 'All') {
    query.status = req.query.status;
  }

  if (req.query.priority && req.query.priority !== 'All') {
    query.priority = req.query.priority;
  }

  if (req.query.assignedTo) {
    query.assignedTo = req.query.assignedTo;
  }

  const tasks = await Task.find(query)
    .populate('assignedTo', 'name email role')
    .sort({ dueDate: 1 });

  res.json({
    success: true,
    status: 200,
    data: tasks
  });
});

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id).populate('assignedTo', 'name email role');

  if (!task) {
    return res.status(404).json({ success: false, status: 404, message: 'Task not found' });
  }

  res.json({
    success: true,
    status: 200,
    data: task
  });
});

// @desc    Create task
// @route   POST /api/tasks
// @access  Private
const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, priority, dueDate, assignedTo, relatedTo } = req.body;

  if (!title) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: 'Task title is required'
    });
  }

  const assignee = assignedTo || req.user._id;

  const task = await Task.create({
    title,
    description,
    status: status || 'Todo',
    priority: priority || 'Medium',
    dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    assignedTo: assignee,
    relatedTo: relatedTo || { itemType: 'General' }
  });

  await task.populate('assignedTo', 'name email role');

  if (assignee.toString() !== req.user._id.toString()) {
    await Notification.create({
      recipient: assignee,
      title: 'New Task Assigned',
      message: `You were assigned: "${task.title}" (Priority: ${task.priority})`,
      type: 'task',
      link: '/tasks'
    });
  }

  res.status(201).json({
    success: true,
    status: 201,
    message: 'Task created successfully',
    data: task
  });
});

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('assignedTo', 'name email role');

  if (!task) {
    return res.status(404).json({ success: false, status: 404, message: 'Task not found' });
  }

  res.json({
    success: true,
    status: 200,
    message: 'Task updated successfully',
    data: task
  });
});

// @desc    Update task status
// @route   PUT /api/tasks/:id/status
// @access  Private
const updateTaskStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['Todo', 'In Progress', 'Completed'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: 'Status must be Todo, In Progress, or Completed'
    });
  }

  const task = await Task.findById(req.params.id);
  if (!task) {
    return res.status(404).json({ success: false, status: 404, message: 'Task not found' });
  }

  task.status = status;
  await task.save();
  await task.populate('assignedTo', 'name email role');

  res.json({
    success: true,
    status: 200,
    message: `Task marked as ${status}`,
    data: task
  });
});

// @desc    Bulk assign tasks
// @route   POST /api/tasks/bulk-assign
// @access  Private
const bulkAssignTasks = asyncHandler(async (req, res) => {
  const { taskIds, assignedTo } = req.body;

  if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0 || !assignedTo) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: 'Please provide taskIds array and assignedTo user ID'
    });
  }

  await Task.updateMany(
    { _id: { $in: taskIds } },
    { $set: { assignedTo } }
  );

  await Notification.create({
    recipient: assignedTo,
    title: 'Multiple Tasks Assigned',
    message: `${taskIds.length} tasks were assigned to you.`,
    type: 'task',
    link: '/tasks'
  });

  res.json({
    success: true,
    status: 200,
    message: `Successfully reassigned ${taskIds.length} tasks`
  });
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);

  if (!task) {
    return res.status(404).json({ success: false, status: 404, message: 'Task not found' });
  }

  res.json({
    success: true,
    status: 200,
    message: 'Task deleted successfully'
  });
});

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  bulkAssignTasks,
  deleteTask
};
