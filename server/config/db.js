const mongoose = require('mongoose');

let mongoMemoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/crm360';
  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.log(`Notice: Local MongoDB server not reachable (${err.message}).`);
    console.log('Starting high-performance In-Memory MongoDB Server for CRM360...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const memUri = mongoMemoryServer.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`In-Memory MongoDB Connected at: ${memUri}`);
      return conn;
    } catch (memErr) {
      console.error('Failed to initialize in-memory database:', memErr.message);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
