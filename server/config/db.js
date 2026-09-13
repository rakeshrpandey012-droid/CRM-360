const mongoose = require('mongoose');

let cachedConnection = null;
let mongoMemoryServer = null;

const connectDB = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/crm360';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    cachedConnection = conn;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    // If running in Vercel or cloud serverless, mongodb-memory-server binary download will timeout/fail
    if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
      console.warn('Notice: Running on Serverless environment without accessible MongoDB URI.');
      console.warn('To enable persistent storage, configure MONGO_URI in your Vercel Project Settings.');
      throw err;
    }

    console.log(`Notice: Local MongoDB server not reachable (${err.message}).`);
    console.log('Starting high-performance In-Memory MongoDB Server for CRM360...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const memUri = mongoMemoryServer.getUri();
      const conn = await mongoose.connect(memUri);
      cachedConnection = conn;
      console.log(`In-Memory MongoDB Connected at: ${memUri}`);
      return conn;
    } catch (memErr) {
      console.error('Failed to initialize in-memory database:', memErr.message);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
