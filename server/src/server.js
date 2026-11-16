import app from './app.js';
import { connectDB } from './config/db.js';
import { ENV, validateEnv } from './config/env.js';

const startServer = async () => {
  try {
    // 1. Validate environment configuration
    validateEnv();

    // 2. Connect to MongoDB Atlas
    await connectDB();

    // 3. Start HTTP server
    const server = app.listen(ENV.PORT, () => {
      console.log(`======================================================`);
      console.log(`[FINDIT Server] Running in ${ENV.NODE_ENV.toUpperCase()} mode`);
      console.log(`[FINDIT Server] Listening on http://localhost:${ENV.PORT}`);
      console.log(`[FINDIT Server] Client origin: ${ENV.CLIENT_URL}`);
      console.log(`[FINDIT Server] Auth API: http://localhost:${ENV.PORT}/api/v1/auth`);
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
