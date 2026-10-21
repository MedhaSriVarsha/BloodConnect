import { Router } from 'express';
import { trustedCircleController } from '../controllers/trustedCircleController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Public code lookup preview (identifies circle, does not expose member details)
router.get('/lookup/:code', trustedCircleController.lookupCircle);

// All subsequent operations require authentication
router.use(authenticateToken);

router.post('/', trustedCircleController.createCircle);
router.post('/join', trustedCircleController.joinCircle);
router.get('/my', trustedCircleController.getMyCircles);
router.get('/:id/members', trustedCircleController.getCircleMembers);
router.delete('/:id/members/:memberId', trustedCircleController.removeMember);
router.patch('/me/availability', trustedCircleController.updateMyAvailability);

export default router;
