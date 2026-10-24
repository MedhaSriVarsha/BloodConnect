import { Router } from 'express';
import { adminController } from '../controllers/adminController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

// Protect all admin routes strictly with authentication and ADMIN role check
router.use(authenticateToken);
router.use(requireRole(['ADMIN', 'SUPER_ADMIN']));

router.get('/dashboard', adminController.getDashboardSummary);
router.get('/donors', adminController.getDonors);
router.patch('/users/:id/status', adminController.updateUserStatus);
router.get('/audit-logs', adminController.getAuditLogs);
router.get('/smtp-pool', adminController.getSmtpConfig);
router.post('/smtp-pool', adminController.updateSmtpUser);
router.post('/test-3-mails-otp', adminController.test3MailsOtp);

// Database backup and recovery management
router.post('/database/backup', adminController.createBackup);
router.get('/database/backups', adminController.listBackups);
router.post('/database/restore', adminController.restoreBackup);

export default router;
