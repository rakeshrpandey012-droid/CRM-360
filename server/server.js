const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { seedDataIfEmpty } = require('./utils/seeder');

// Load environment variables
dotenv.config();

const app = express();

// Security Headers & Cross-Origin Resource Sharing
app.use(helmet());
app.use(cors({
  origin: true,
  credentials: true
}));

// Body parser
app.use(express.json());

// Request logger for development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Database Connection Middleware
// Ensures MongoDB is connected & demo data is seeded before serving any request (essential for Vercel Serverless)
let dbInitialized = false;
let dbConnectPromise = null;

app.use(async (req, res, next) => {
  // Allow healthcheck even if DB is still connecting
  if (req.path === '/api/health') {
    return next();
  }

  try {
    if (!dbConnectPromise) {
      dbConnectPromise = connectDB();
    }
    await dbConnectPromise;

    if (!dbInitialized) {
      await seedDataIfEmpty();
      dbInitialized = true;
    }
    next();
  } catch (err) {
    dbConnectPromise = null;
    console.error('Database connection error in request handler:', err.message);

    if (req.path.startsWith('/api')) {
      return res.status(503).json({
        success: false,
        status: 503,
        message: 'Database connection currently unavailable. Please verify MONGO_URI configuration in your environment variables.',
        details: process.env.NODE_ENV === 'production' ? undefined : err.message
      });
    }
    next(err);
  }
});

// Rate Limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per IP per window
  message: {
    success: false,
    status: 429,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  const dbStatusMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.json({
    success: true,
    status: 200,
    message: 'CRM360 SaaS API is running healthy',
    database: dbStatusMap[mongoose.connection.readyState] || 'unknown',
    environment: process.env.NODE_ENV || 'development',
    serverless: Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME),
    timestamp: new Date().toISOString()
  });
});

// Primary API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/leads', require('./routes/leadRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// 404 Not Found Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    status: 404,
    message: `API Route Not Found - [${req.method}] ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: err.message || 'Internal Server Error',
    errors: err.errors || null,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await seedDataIfEmpty();
    dbInitialized = true;

    app.listen(PORT, () => {
      console.log(`CRM360 Backend Server active on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
  } catch (err) {
    console.error('Failed to start standalone server:', err.message);
  }
};

// Only start standalone HTTP server if not in Vercel / serverless environment
if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  startServer();
}

module.exports = app;
