import { Router } from 'express';
import { getAll, getById, create, updateStatus, cancel, getItems } from '../controllers/order.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken);
router.get('/', getAll);
router.get('/:id', getById);
router.get('/:id/items', getItems);
router.post('/', create);
router.put('/:id/status', updateStatus);
router.put('/:id/cancel', cancel);

export default router;
