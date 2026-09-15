const mongoose = require('mongoose');

// Global cache for serverless environments (e.g. Vercel) to prevent connection leaks
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

let mongoMemoryServer = null;

/**
 * Connect to MongoDB database.
 * Supports:
 * 1. Cloud MongoDB Atlas via MONGO_URI
 * 2. Local MongoDB server (mongodb://127.0.0.1:27017/crm360)
 * 3. Automatic In-Memory MongoDB fallback for local development & testing
 */
const connectDB = async () => {
  // Return active connection if ready
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
  const uri = process.env.MONGO_URI;

  // 1. If MONGO_URI is explicitly configured, connect to it
  if (uri) {
    try {
      if (!cached.promise) {
        const opts = {
          serverSelectionTimeoutMS: 4000,
          maxPoolSize: 10,
        };

        cached.promise = mongoose.connect(uri, opts).then((m) => {
          console.log(`[MongoDB] Successfully connected to database: ${m.connection.name || 'crm360'}`);
          return m;
        });
      }

      cached.conn = await cached.promise;
      return cached.conn;
    } catch (err) {
      cached.promise = null;
      console.warn(`[MongoDB Warning] Could not connect with MONGO_URI (${err.message}).`);
      
      if (isServerless) {
        throw new Error(`MongoDB connection failed in serverless environment: ${err.message}. Ensure MONGO_URI is correctly configured with network access enabled.`);
      }
      
      console.log('[MongoDB] Seamlessly falling back to isolated In-Memory MongoDB for local development...');
    }
  }

  // 2. Serverless environment without MONGO_URI configured
  if (isServerless) {
    const errorMsg = 'Running in Serverless/Vercel environment but MONGO_URI is not set. Please add MONGO_URI in your Vercel Project Environment Variables.';
    console.warn(`[MongoDB Notice] ${errorMsg}`);
    throw new Error(errorMsg);
  }

  // 3. Local In-Memory / Default MongoDB Fallback
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    if (!mongoMemoryServer) {
      mongoMemoryServer = await MongoMemoryServer.create({
        instance: {
          launchTimeout: 60000,
        },
      });
    }
    const memUri = mongoMemoryServer.getUri();
    const conn = await mongoose.connect(memUri);
    cached.conn = conn;
    console.log(`[MongoDB] In-Memory MongoDB active at: ${memUri}`);
    return conn;
  } catch (memErr) {
    console.error('[MongoDB] Failed to initialize in-memory database:', memErr.message);
    throw memErr;
  }
};

module.exports = connectDB;
