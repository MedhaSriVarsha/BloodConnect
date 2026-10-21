import { Router } from 'express';
import { institutionController } from '../controllers/institutionController.js';

const router = Router();

router.get('/', institutionController.getInstitutions);
router.get('/:id', institutionController.getInstitutionById);

export default router;
