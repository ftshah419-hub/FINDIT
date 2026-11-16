import express from 'express';
import { userController } from '../controllers/userController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.get('/me', userController.getProfile);
router.patch('/me', userController.updateProfile);
router.post('/change-password', userController.changePassword);
router.get('/dashboard-stats', userController.getDashboardStats);

export default router;
