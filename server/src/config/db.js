import mongoose from 'mongoose';
import { ENV } from './env.js';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true,
    });

    isConnected = !!conn.connections[0].readyState;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[Database Error] Could not connect to MongoDB: ${error.message}`);
    if (ENV.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[Database] MongoDB disconnected.');
  isConnected = false;
});

mongoose.connection.on('error', (err) => {
  console.error(`[Database Error] Mongoose runtime error: ${err.message}`);
});
