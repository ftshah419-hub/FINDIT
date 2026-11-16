import app from './app.js';
import { connectDB } from './config/db.js';
import { ENV, validateEnv } from './config/env.js';
import { seedInitialData } from './scripts/seed.js';

const startServer = async () => {
  try {
    // 1. Validate environment configuration
    validateEnv();

    // 2. Connect to MongoDB Atlas or In-Memory fallback
    await connectDB();

    // 3. Seed initial data if in development or demo mode
    try {
      await seedInitialData();
    } catch (seedErr) {
      console.warn('[Seed] Seed script skipped or existing data present:', seedErr.message);
    }

    // 4. Start HTTP server
    const port = ENV.PORT || process.env.PORT || 5000;
    const server = app.listen(port, () => {
      console.log(`======================================================`);
      console.log(`[FINDIT Server] Running in ${(ENV.NODE_ENV || 'development').toUpperCase()} mode`);
      console.log(`[FINDIT Server] Listening on http://localhost:${port}`);
      console.log(`[FINDIT Server] Client origin: ${ENV.CLIENT_URL || 'http://localhost:5173'}`);
      console.log(`[FINDIT Server] API Base: http://localhost:${port}/api/v1`);
      console.log(`======================================================`);
    });

    // Graceful Shutdown
    const handleShutdown = (signal) => {
      console.log(`\n[Process] ${signal} signal received. Closing HTTP server gracefully...`);
      server.close(() => {
        console.log('[Process] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));
  } catch (err) {
    console.error(`[Server Fatal Error] Failed to start server: ${err.message}`);
    process.exit(1);
  }
};

startServer();
