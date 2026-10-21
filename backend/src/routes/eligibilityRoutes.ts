import { Router } from 'express';
import { eligibilityController } from '../controllers/eligibilityController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Publicly accessible for quick health screening
router.post('/evaluate', eligibilityController.evaluateEligibility);

// Authenticated user past checks
router.get('/my-history', authenticateToken, eligibilityController.getMyAssessments);

export default router;
