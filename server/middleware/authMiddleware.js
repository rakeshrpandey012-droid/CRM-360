const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'crm360_jwt_secret_production_key_2026');
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          status: 401,
          message: 'User no longer exists with this token'
        });
      }

      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        status: 401,
        message: 'Not authorized, token failed or expired'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      status: 401,
      message: 'Not authorized, no token provided in headers'
    });
  }
});

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        status: 403,
        message: `Role (${req.user ? req.user.role : 'Guest'}) is not authorized to perform this action`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
