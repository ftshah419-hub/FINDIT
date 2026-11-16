const mongoose = require('mongoose');

let mongodInstance = null;

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;

  // If explicit remote MongoDB Atlas URI is provided and not default localhost
  if (mongoURI && !mongoURI.includes('127.0.0.1') && !mongoURI.includes('localhost')) {
    try {
      console.log(`[Database] Connecting to MongoDB Atlas...`);
      const conn = await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`[Database] MongoDB Atlas Connected: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.warn(`[Database Warning] Atlas connection failed (${err.message}). Falling back to local in-memory DB...`);
    }
  }

  // Try standard local MongoDB if configured
  try {
    const localURI = mongoURI || 'mongodb://127.0.0.1:27017/findit';
    const conn = await mongoose.connect(localURI, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[Database] Connected to local MongoDB: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    // Local MongoDB not running; launch mongodb-memory-server
    console.log('[Database] Starting embedded in-memory MongoDB engine for zero-dependency execution...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create({
        instance: {
          dbName: 'findit',
        },
      });
      const uri = mongodInstance.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`[Database] Embedded MongoDB running at: ${uri}`);

      // Auto-seed initial data
      const seeder = require('../scripts/seedAdminDataInternal');
      await seeder();

      return conn;
    } catch (memErr) {
      console.error('[Database Fatal] Could not establish MongoDB connection:', memErr.message);
      throw memErr;
    }
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
};

module.exports = connectDB;
module.exports.disconnectDB = disconnectDB;
