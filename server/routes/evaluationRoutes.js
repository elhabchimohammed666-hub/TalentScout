import express from 'express';
import {
  getEvaluations,
  getEvaluationById,
  createEvaluation,
  updateEvaluation,
  deleteEvaluation,
  compareEvaluations,
} from '../controllers/evaluationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/compare', compareEvaluations);
router.route('/')
  .get(getEvaluations)
  .post(createEvaluation);

router.route('/:id')
  .get(getEvaluationById)
  .put(updateEvaluation)
  .delete(deleteEvaluation);

export default router;
