import express from 'express';
import { claimController } from '../controllers/claimController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.get('/me', claimController.getUserClaims);
router.get('/:claimId', claimController.getClaimById);
router.patch('/:claimId/withdraw', claimController.withdrawClaim);

export default router;
