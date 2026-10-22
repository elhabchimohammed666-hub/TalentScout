import express from 'express';
import { getAcademyOverview, getCoachOverview } from '../controllers/statsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/overview', authorize('academy_manager'), getAcademyOverview);
router.get('/coach-overview', getCoachOverview);

export default router;
