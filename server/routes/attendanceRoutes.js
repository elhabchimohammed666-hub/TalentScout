import express from 'express';
import {
  recordSessionAttendance,
  getSessionAttendance,
  getPlayerAttendanceHistory,
  getAttendanceStats,
} from '../controllers/attendanceController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/stats', getAttendanceStats);
router.route('/session/:sessionId')
  .get(getSessionAttendance)
  .post(recordSessionAttendance);
router.get('/player/:playerId', getPlayerAttendanceHistory);

export default router;
