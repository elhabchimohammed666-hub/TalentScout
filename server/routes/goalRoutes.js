import express from 'express';
import {
  getPlayerGoals,
  createGoal,
  updateGoal,
  deleteGoal,
} from '../controllers/goalController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', createGoal);
router.get('/player/:playerId', getPlayerGoals);
router.route('/:id')
  .put(updateGoal)
  .delete(deleteGoal);

export default router;
