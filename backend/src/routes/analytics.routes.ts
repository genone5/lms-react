import { Router } from 'express';
import { getRevenue, getTestVolume, getPatientStats, getDailyActivity } from '../controllers/analytics.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken);
router.get('/revenue', getRevenue);
router.get('/test-volume', getTestVolume);
router.get('/patients', getPatientStats);
router.get('/daily', getDailyActivity);

export default router;
