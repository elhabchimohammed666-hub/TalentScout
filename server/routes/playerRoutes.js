import express from 'express';
import {
  getPlayers,
  getPlayerById,
  createPlayer,
  updatePlayer,
  archivePlayer,
  deletePlayer,
} from '../controllers/playerController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getPlayers)
  .post(createPlayer);

router.route('/:id')
  .get(getPlayerById)
  .put(updatePlayer)
  .delete(authorize('academy_manager'), deletePlayer);

router.put('/:id/archive', archivePlayer);

export default router;
