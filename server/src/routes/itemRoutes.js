import express from 'express';
import { itemController } from '../controllers/itemController.js';
import { claimController } from '../controllers/claimController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/', itemController.getPublicItems);
router.get('/me', protect, itemController.getUserItems);
router.get('/:itemId', itemController.getItemById);

// Protected routes
router.post('/', protect, itemController.createItem);
router.patch('/:itemId', protect, itemController.updateUserItem);
router.delete('/:itemId', protect, itemController.deleteUserItem);

// Claim action against item
router.post('/:itemId/claims', protect, claimController.submitClaim);

export default router;
