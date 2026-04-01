import { Router } from 'express';
import { getLabInfo, updateLabInfo, getEmailSettings, updateEmailSettings } from '../controllers/settings.controller.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken);
router.get('/lab', getLabInfo);
router.put('/lab', authorizeRoles('Admin'), updateLabInfo);
router.get('/email', authorizeRoles('Admin'), getEmailSettings);
router.put('/email', authorizeRoles('Admin'), updateEmailSettings);

export default router;
