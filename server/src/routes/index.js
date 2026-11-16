import express from 'express';
import authRoutes from './authRoutes.js';
import itemRoutes from './itemRoutes.js';
import claimRoutes from './claimRoutes.js';
import aiMatchRoutes from './aiMatchRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import userRoutes from './userRoutes.js';
import uploadRoutes from './uploadRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/items', itemRoutes);
router.use('/claims', claimRoutes);
router.use('/ai-matches', aiMatchRoutes);
router.use('/notifications', notificationRoutes);
router.use('/users', userRoutes);
router.use('/uploads', uploadRoutes);
router.use('/categories', categoryRoutes);
router.use('/admin', adminRoutes);

export default router;
