import { Router } from 'express';
import { getAll, getById, generate, download } from '../controllers/report.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken);
router.get('/', getAll);
router.get('/:id', getById);
router.post('/generate', generate);
router.get('/:id/download', download);

export default router;
