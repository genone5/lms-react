import { Router } from 'express';
import { getAll, getById, create, update, deactivate, getActivityLogs } from '../controllers/user.controller.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken, authorizeRoles('Admin'));
router.get('/', getAll);
router.get('/:id', getById);
router.get('/:id/activity', getActivityLogs);
router.post('/', create);
router.put('/:id', update);
router.put('/:id/toggle-status', deactivate);

export default router;
