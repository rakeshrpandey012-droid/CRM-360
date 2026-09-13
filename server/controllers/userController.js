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

// @desc    Update user role (Admin only)
// @route   PUT /api/users/:id/role
// @access  Private/Admin
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const allowedRoles = ['Admin', 'Sales Manager', 'Sales Executive'];

  if (!role || !allowedRoles.includes(role)) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: `Invalid role. Allowed roles: ${allowedRoles.join(', ')}`
    });
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, status: 404, message: 'User not found' });
  }

  user.role = role;
  await user.save();

  res.json({
    success: true,
    status: 200,
    message: `Role for ${user.name} updated to ${role}`,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department
    }
  });
});

// @desc    Create / invite team member
// @route   POST /api/users
// @access  Private/Admin
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, department, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: 'Name, email, and temporary password are required'
    });
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: 'A user with this email already exists'
    });
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: role || 'Sales Executive',
    department: department || 'Sales',
    phone: phone || ''
  });

  res.status(201).json({
    success: true,
    status: 201,
    message: `Team member ${user.name} created successfully`,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department
    }
  });
});

// @desc    Delete team member
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  if (req.user._id.toString() === req.params.id) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: 'Cannot delete your own account from the team roster'
    });
  }

  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, status: 404, message: 'User not found' });
  }

  res.json({
    success: true,
    status: 200,
    message: `User ${user.name} removed from team`
  });
});

module.exports = {
  getUsers,
  getUserById,
  updateUserRole,
  createUser,
  deleteUser
};
