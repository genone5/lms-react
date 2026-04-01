import { Router } from 'express';
import { getAll, getById, create, update, remove, getTestHistory } from '../controllers/patient.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken);
router.get('/', getAll);
router.get('/:id', getById);
router.get('/:id/history', getTestHistory);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

export default router;
