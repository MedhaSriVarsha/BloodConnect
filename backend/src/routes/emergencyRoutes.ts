import { Router } from 'express';
import { trustedCircleController } from '../controllers/trustedCircleController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.post('/', trustedCircleController.createEmergency);
router.post('/:id/notify-circle', trustedCircleController.notifyCircle);

export default router;
