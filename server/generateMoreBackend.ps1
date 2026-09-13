# controllers/dashboardController.js
$dashboardController = @'
const asyncHandler = require('express-async-handler');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const Task = require('../models/Task');

exports.getStats = asyncHandler(async (req, res) => {
  const totalCustomers = await Customer.countDocuments({ isDeleted: false });
  const activeLeads = await Lead.countDocuments({ status: { $ne: 'Won' } });
  const pendingTasks = await Task.countDocuments({ status: { $ne: 'Completed' } });
  
  res.json({
    success: true,
    status: 200,
    data: {
      totalCustomers,
      activeLeads,
      pendingTasks,
      revenue: 50000 // Placeholder
    }
  });
});
'@
Set-Content -Path .\controllers\dashboardController.js -Value $dashboardController -Encoding UTF8

# routes/dashboardRoutes.js
$dashboardRoutes = @'
const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.route('/stats').get(protect, getStats);

module.exports = router;
'@
Set-Content -Path .\routes\dashboardRoutes.js -Value $dashboardRoutes -Encoding UTF8

# controllers/taskController.js
$taskController = @'
const asyncHandler = require('express-async-handler');
const Task = require('../models/Task');

exports.getTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find();
  res.json({ success: true, status: 200, data: tasks });
});

exports.createTask = asyncHandler(async (req, res) => {
  const task = await Task.create(req.body);
  res.status(201).json({ success: true, status: 201, data: task });
});
'@
Set-Content -Path .\controllers\taskController.js -Value $taskController -Encoding UTF8

# routes/taskRoutes.js
$taskRoutes = @'
const express = require('express');
const router = express.Router();
const { getTasks, createTask } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getTasks).post(protect, createTask);

module.exports = router;
'@
Set-Content -Path .\routes\taskRoutes.js -Value $taskRoutes -Encoding UTF8
