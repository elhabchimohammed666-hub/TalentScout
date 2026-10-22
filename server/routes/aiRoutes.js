import express from 'express';
import {
  requestPlayerAnalysis,
  getPlayerAnalysisHistory,
  getAnalysisById,
} from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/analyze/:playerId', requestPlayerAnalysis);
router.get('/player/:playerId', getPlayerAnalysisHistory);
router.get('/:id', getAnalysisById);

export default router;
