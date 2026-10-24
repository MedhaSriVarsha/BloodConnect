import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

// Connection pooling and query logging
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  errorFormat: 'pretty',
});

export async function connectDatabase(): Promise<boolean> {
  try {
    await prisma.$connect();
    logger.info('Connected to PostgreSQL database via Prisma');
    return true;
  } catch (err: any) {
    logger.warn(`Primary database connection unavailable (${err.message}). Using hybrid in-memory fallback store.`);
    return false;
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    logger.info('Disconnected from database');
  } catch (err: any) {
    logger.error('Error during database disconnect', err);
  }
}
