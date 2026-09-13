const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');

const Task = require('../models/Task');

// @desc    Get notifications for user
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  // Dynamically check for upcoming task deadlines (< 48 hours)
  try {
    const now = new Date();
    const twoDaysFromNow = new Date(Date.now() + 48 * 60 * 60 * 1000);

    const impendingTasks = await Task.find({
      assignedTo: req.user._id,
      status: { $ne: 'Completed' },
      dueDate: { $gte: now, $lte: twoDaysFromNow }
    }).limit(3);

    for (const task of impendingTasks) {
      const existingNotif = await Notification.findOne({
        recipient: req.user._id,
        type: 'deadline',
        message: { $regex: task.title, $options: 'i' }
      });

      if (!existingNotif) {
        const dueDateFormatted = new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' });
        await Notification.create({
          recipient: req.user._id,
          title: 'Upcoming Deadline Alert',
          message: `Task "${task.title}" is due soon (${dueDateFormatted}). Priority: ${task.priority}`,
          type: 'deadline',
          link: '/tasks'
        });
      }
    }
  } catch (err) {
    // quiet fail if task query has issue
    console.error('Deadline notification check error:', err.message);
  }

  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .limit(20);

  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false
  });

  res.json({
    success: true,
    status: 200,
    data: {
      notifications,
      unreadCount
    }
  });
});

// @desc    Mark single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { isRead: true },
    { new: true }
  );

  res.json({
    success: true,
    status: 200,
    data: notification
  });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { $set: { isRead: true } }
  );

  res.json({
    success: true,
    status: 200,
    message: 'All notifications marked as read'
  });
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};
