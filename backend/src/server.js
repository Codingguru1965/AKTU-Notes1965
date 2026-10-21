import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { PORT, NODE_ENV } from './config/env.js';
import { syncUploadsToGridFS } from './services/gridfsService.js';

const startServer = async () => {
  try {
    await connectDB();

    // Ensure all bundled or local PDFs are persisted in MongoDB GridFS
    syncUploadsToGridFS().catch(err => {
      console.warn('[GridFS] Startup sync error:', err.message);
    });

    const server = app.listen(PORT, () => {
      console.log(`[AKTU Notes1965] Backend running on port ${PORT} in ${NODE_ENV} mode`);
    });

    const shutdown = async (signal) => {
      console.log(`\nReceived ${signal}. Gracefully shutting down...`);
      server.close(async () => {
        await disconnectDB();
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
