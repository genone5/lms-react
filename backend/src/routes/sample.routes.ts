import { Router } from 'express';
import { getPending, collect, updateStatus, getHistory } from '../controllers/sample.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken);
router.get('/', getHistory);
router.get('/pending', getPending);
router.post('/', collect);
router.put('/:id/status', updateStatus);

export default router;
