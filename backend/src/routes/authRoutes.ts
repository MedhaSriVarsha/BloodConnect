import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { authLimiter } from '../middleware/security.js';

const router = Router();

// Public auth endpoints with sensitive rate limiting
router.post('/register', authLimiter, authController.register);
router.post('/verify-email', authLimiter, authController.verifyOtp);
router.post('/verify-phone', authLimiter, authController.verifyOtp);
router.post('/otp/resend', authLimiter, authController.resendOtp);
router.post('/login', authLimiter, authController.login);

// Authenticated auth endpoints
router.post('/donor-profile', authenticateToken, authController.completeDonorProfile);
router.get('/me', authenticateToken, authController.getMe);
router.post('/logout', authenticateToken, authController.logout);

export default router;
