import { Router } from 'express';
import { referralController } from '../controllers/referralController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/me', authenticateToken, referralController.getMyReferral);
router.get('/validate/:code', referralController.validateCode);

export default router;
