import express from 'express';
import { aiMatchController } from '../controllers/aiMatchController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.get('/me', aiMatchController.getUserMatches);
router.patch('/:matchId/dismiss', aiMatchController.dismissMatch);

export default router;
