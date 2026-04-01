import { Router } from 'express';
import { getAll, enter, update, verify } from '../controllers/result.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken);
router.get('/', getAll);
router.post('/', enter);
router.put('/:id', update);
router.put('/:id/verify', verify);

export default router;
