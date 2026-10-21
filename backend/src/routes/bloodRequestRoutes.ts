import { Router } from 'express';
import { bloodRequestController } from '../controllers/bloodRequestController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Public list to see urgent calls for blood
router.get('/', bloodRequestController.getRequests);

// Creation and donation require authentication
router.post('/', authenticateToken, bloodRequestController.createRequest);
router.post('/:id/volunteer', authenticateToken, bloodRequestController.volunteerToDonate);

export default router;
