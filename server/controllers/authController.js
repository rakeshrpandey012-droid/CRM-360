const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone } = req.body;

  if (!name || name.trim().length < 2 || name.trim().length > 50) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: 'Validation Error',
      errors: [{ field: 'name', message: 'Name must be between 2 and 50 characters' }]
    });
  }

  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: 'Validation Error',
      errors: [{ field: 'email', message: 'Please provide a valid email address' }]
    });
  }

  // Password: Min 8 chars, 1 uppercase, 1 number, 1 special char
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
  if (!password || !passwordRegex.test(password)) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: 'Validation Error',
      errors: [{
        field: 'password',
        message: 'Password must be at least 8 characters long, contain at least 1 uppercase letter, 1 number, and 1 special character'
      }]
    });
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: 'An account with this email address already exists'
    });
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: role || 'Sales Executive',
    phone: phone || ''
  });

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  res.status(201).json({
    success: true,
    status: 201,
    message: 'User registered successfully',
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      },
      accessToken,
      refreshToken
    }
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: 'Please provide both email and password'
    });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({
      success: false,
      status: 401,
      message: 'Invalid credentials. Please verify your email and password.'
    });
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    status: 200,
    message: 'Login successful',
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      },
      accessToken,
      refreshToken
    }
  });
});

// @desc    Refresh token
// @route   POST /api/auth/refresh-token
// @access  Public
const refreshToken = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({
      success: false,
      status: 401,
      message: 'Refresh token is required'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'crm360_refresh_secret_key_2026');
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== token) {
      return res.status(401).json({
        success: false,
        status: 401,
        message: 'Invalid or revoked refresh token'
      });
    }

    const newAccessToken = generateAccessToken(user._id);
    res.json({
      success: true,
      status: 200,
      message: 'Token refreshed successfully',
      data: { accessToken: newAccessToken }
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      status: 401,
      message: 'Expired or invalid refresh token'
    });
  }
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email ? email.toLowerCase() : '' });

  if (!user) {
    return res.status(404).json({
      success: false,
      status: 404,
      message: 'No user found with that email address'
    });
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    status: 200,
    message: 'Password reset token generated. In a production environment, this is sent via email.',
    data: {
      resetToken,
      resetUrl: `/reset-password/${resetToken}`
    }
  });
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: 'Invalid or expired password reset token'
    });
  }

  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
  if (!req.body.password || !passwordRegex.test(req.body.password)) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: 'Password must be at least 8 characters long, contain at least 1 uppercase letter, 1 number, and 1 special character'
    });
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  const accessToken = generateAccessToken(user._id);
  res.json({
    success: true,
    status: 200,
    message: 'Password reset successful',
    data: { accessToken }
  });
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({
    success: true,
    status: 200,
    data: user
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/updatedetails
// @access  Private
const updateDetails = asyncHandler(async (req, res) => {
  const fieldsToUpdate = {
    name: req.body.name,
    phone: req.body.phone
  };

  if (req.body.email) {
    fieldsToUpdate.email = req.body.email.toLowerCase();
  }

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.json({
    success: true,
    status: 200,
    message: 'Profile updated successfully',
    data: user
  });
});

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
const updatePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.matchPassword(req.body.currentPassword))) {
    return res.status(401).json({
      success: false,
      status: 401,
      message: 'Current password is incorrect'
    });
  }

  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
  if (!req.body.newPassword || !passwordRegex.test(req.body.newPassword)) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: 'New password must be at least 8 characters long, contain at least 1 uppercase letter, 1 number, and 1 special character'
    });
  }

  user.password = req.body.newPassword;
  await user.save();

  const accessToken = generateAccessToken(user._id);
  res.json({
    success: true,
    status: 200,
    message: 'Password updated successfully',
    data: { accessToken }
  });
});

module.exports = {
  register,
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
  getMe,
  updateDetails,
  updatePassword
};
