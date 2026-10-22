import express from 'express';
import {
  getSessions,
  getSessionById,
  createSession,
  updateSession,
  deleteSession,
} from '../controllers/sessionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getSessions)
  .post(createSession);

router.route('/:id')
  .get(getSessionById)
  .put(updateSession)
  .delete(deleteSession);

export default router;
