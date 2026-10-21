import { Router } from 'express';
import { donorController } from '../controllers/donorController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Search donors with privacy protection
router.get('/search', donorController.searchDonors);
router.get('/:id', donorController.getDonorById);

// Donor availability toggle
router.patch('/me/availability', authenticateToken, donorController.toggleAvailability);

export default router;
