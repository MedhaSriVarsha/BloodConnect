import app from './app.js';
import { logger } from './utils/logger.js';

const PORT = parseInt(process.env.PORT || '5000', 10);

const server = app.listen(PORT, () => {
  logger.info(`🩸 BloodConnect Mission-Critical Backend Server running on port ${PORT}`);
  logger.info(`📡 API Health Check available at http://localhost:${PORT}/api/v1/health`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Closing HTTP server gracefully.');
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Closing HTTP server.');
  server.close(() => {
    process.exit(0);
  });
});
