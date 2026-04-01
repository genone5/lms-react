import { Router } from 'express';
import { getAll, getById, getCategories, create, update, remove } from '../controllers/test.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken);
router.get('/', getAll);
router.get('/categories', getCategories);
router.get('/:id', getById);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

export default router;
