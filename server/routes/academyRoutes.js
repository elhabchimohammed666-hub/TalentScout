import express from 'express';
import { getAcademy, updateAcademy } from '../controllers/academyController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAcademy)
  .put(authorize('academy_manager'), updateAcademy);

export default router;
