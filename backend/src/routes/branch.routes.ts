import { Router } from 'express';
import { getAll, getById, create, update, remove, getStaff } from '../controllers/branch.controller.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken);
router.get('/', getAll);
router.get('/:id', getById);
router.get('/:id/staff', getStaff);
router.post('/', authorizeRoles('Admin'), create);
router.put('/:id', authorizeRoles('Admin'), update);
router.delete('/:id', authorizeRoles('Admin'), remove);

export default router;
