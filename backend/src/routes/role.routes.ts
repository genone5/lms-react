import { Router } from 'express';
import { getAll, getById, create, update, remove, getPermissionMatrix } from '../controllers/role.controller.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken, authorizeRoles('Admin'));
router.get('/', getAll);
router.get('/permissions', getPermissionMatrix);
router.get('/:id', getById);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

export default router;
