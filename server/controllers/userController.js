const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Get all users (for team dropdowns / assignments)
// @route   GET /api/users
// @access  Private
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password');
  res.json({
    success: true,
    status: 200,
    data: users
  });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) {
    return res.status(404).json({ success: false, status: 404, message: 'User not found' });
  }
  res.json({ success: true, status: 200, data: user });
});

module.exports = {
  getUsers,
  getUserById
};
