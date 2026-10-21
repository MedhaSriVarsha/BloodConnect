import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

import { 
  requestIdMiddleware, 
  helmetMiddleware, 
  corsMiddleware, 
  generalLimiter, 
  errorHandler 
} from './middleware/security.js';

import authRoutes from './routes/authRoutes.js';
import bloodRequestRoutes from './routes/bloodRequestRoutes.js';
import donationRoutes from './routes/donationRoutes.js';
import eligibilityRoutes from './routes/eligibilityRoutes.js';
import donorRoutes from './routes/donorRoutes.js';
import referralRoutes from './routes/referralRoutes.js';
import institutionRoutes from './routes/institutionRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import trustedCircleRoutes from './routes/trustedCircleRoutes.js';
import emergencyRoutes from './routes/emergencyRoutes.js';
import { recentDispatches } from './services/smsEmailService.js';

const app = express();

// Security and utility middleware
app.use(requestIdMiddleware);
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(generalLimiter);

// Health Check
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'BloodConnect API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

// Dev helper: inspect recent simulated OTP dispatches (disabled in production)
app.get('/api/v1/dev/dispatches', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ status: 'error', message: 'Disabled in production' });
  }
  res.status(200).json({ status: 'success', data: recentDispatches });
});

// Mount /api/v1 modules
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/blood-requests', bloodRequestRoutes);
app.use('/api/v1/donations', donationRoutes);
app.use('/api/v1/eligibility', eligibilityRoutes);
app.use('/api/v1/donors', donorRoutes);
app.use('/api/v1/referrals', referralRoutes);
app.use('/api/v1/trusted-circles', trustedCircleRoutes);
app.use('/api/v1/emergencies', emergencyRoutes);
app.use('/api/v1/institutions', institutionRoutes);
app.use('/api/v1/admin', adminRoutes);

// Catch-all 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    code: 'ROUTE_NOT_FOUND',
    message: `API endpoint ${req.originalUrl} not found. Check documentation for /api/v1`,
  });
});

// Centralized error handler
app.use(errorHandler);

export default app;
