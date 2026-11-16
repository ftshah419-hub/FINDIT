import app from './app.js';
import { connectDB } from './config/db.js';
import { seedInitialData } from './scripts/seed.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await seedInitialData();

    app.listen(PORT, () => {
      console.log(`🚀 FINDIT API Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
      console.log(`🔗 API Base: http://localhost:${PORT}/api/v1`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
