import { Router } from 'express';
import { donationController } from '../controllers/donationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/my', authenticateToken, donationController.getMyDonations);
router.post('/log', authenticateToken, donationController.logDonation);
router.get('/certificate/:certificateNumber', donationController.verifyCertificate);

export default router;
