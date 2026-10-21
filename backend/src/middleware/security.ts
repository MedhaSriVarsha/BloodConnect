import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import { logger } from '../utils/logger.js';
import { AuthenticatedRequest } from '../types/index.js';

// Attach unique Request ID
export const requestIdMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const reqId = (req.headers['x-request-id'] as string) || `req-${crypto.randomUUID()}`;
  req.requestId = reqId;
  res.setHeader('X-Request-Id', reqId);
  next();
};

// General rate limiter
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});

// Sensitive Auth / OTP Rate Limiter (strictly limits OTP requests and login attempts)
export const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 15, // limit to 15 attempts per 5 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
    message: 'Too many authentication or OTP attempts. Please wait 5 minutes before retrying.',
  },
});

// Configure Helmet with strict security headers
export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// CORS configuration
export const corsMiddleware = cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
});

// Global Centralized Error Handling Middleware
export const errorHandler = (err: any, req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  logger.error('Unhandled API exception caught', err, {
    requestId: req.requestId,
    path: req.originalUrl,
    method: req.method,
  });

  const statusCode = err.status || err.statusCode || 500;
  const message = statusCode === 500 && process.env.NODE_ENV === 'production' 
    ? 'Internal server error occurred. Please contact BloodConnect support.'
    : err.message || 'An unexpected error occurred';

  res.status(statusCode).json({
    status: 'error',
    code: err.code || 'INTERNAL_ERROR',
    message,
    requestId: req.requestId,
    ...(process.env.NODE_ENV !== 'production' && err.details ? { details: err.details } : {}),
  });
};
