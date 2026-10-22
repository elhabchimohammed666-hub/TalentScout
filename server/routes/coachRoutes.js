import express from 'express';
import {
  getCoaches,
  getCoachById,
  createCoach,
  updateCoach,
  deleteCoach,
} from '../controllers/coachController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getCoaches)
  .post(authorize('academy_manager'), createCoach);

router
  .route('/:id')
  .get(getCoachById)
  .put(authorize('academy_manager'), updateCoach)
  .delete(authorize('academy_manager'), deleteCoach);

export default router;
