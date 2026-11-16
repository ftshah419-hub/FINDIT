import mongoose from 'mongoose';
import { ENV } from './env.js';

let memoryServer = null;
let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    return;
  }

  const uri = ENV.MONGODB_URI || process.env.MONGODB_URI;

  try {
    if (uri && !uri.includes('127.0.0.1') && !uri.includes('localhost')) {
      console.log('Connecting to MongoDB Atlas...');
      const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000, autoIndex: true });
      isConnected = !!conn.connections[0].readyState;
      console.log(`[Database] MongoDB Atlas Connected: ${conn.connection.host}/${conn.connection.name}`);
      return;
    }

    // Try connecting to local URI
    try {
      if (uri) {
        const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000, autoIndex: true });
        isConnected = !!conn.connections[0].readyState;
        console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
        return;
      }
    } catch (localErr) {
      console.log('[Database] Local MongoDB not accessible, starting MongoMemoryServer...');
    }

    // Fallback to in-memory MongoDB
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    const memUri = memoryServer.getUri();
    const conn = await mongoose.connect(memUri, { autoIndex: true });
    isConnected = !!conn.connections[0].readyState;
    console.log(`[Database] In-Memory MongoDB Started & Connected: ${memUri}`);
  } catch (error) {
    console.error(`[Database Error] Could not connect to MongoDB: ${error.message}`);
    if (ENV.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  isConnected = false;
  if (memoryServer) {
    await memoryServer.stop();
  }
};

export const disconnectDB = closeDB;

mongoose.connection.on('disconnected', () => {
  console.warn('[Database] MongoDB disconnected.');
  isConnected = false;
});

mongoose.connection.on('error', (err) => {
  console.error(`[Database Error] Mongoose runtime error: ${err.message}`);
});
