import express from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import adminDashboardController from '../controllers/adminDashboardController.js';
import adminUserController from '../controllers/adminUserController.js';
import adminItemController from '../controllers/adminItemController.js';
import adminClaimController from '../controllers/adminClaimController.js';
import adminCategoryController from '../controllers/adminCategoryController.js';
import adminAIMatchController from '../controllers/adminAIMatchController.js';
import adminReportController from '../controllers/adminReportController.js';
import adminActivityLogController from '../controllers/adminActivityLogController.js';
import adminSettingsController from '../controllers/adminSettingsController.js';

import {
  validateUserStatus,
  validateItemReview,
  validateClaimReview,
  validateCategoryCreate,
  validateCategoryUpdate,
  validateReportReview,
  validateAIMatchReview,
  validateSettingUpdate,
} from '../validators/adminValidators.js';

const router = express.Router();

// Protect all admin routes: Requires valid JWT and ADMIN role
router.use(authenticate, authorize('ADMIN'));

// ==================== DASHBOARD & TELEMETRY ====================
router.get('/dashboard', adminDashboardController.getDashboard);

// ==================== USER MANAGEMENT ====================
router.get('/users', adminUserController.listUsers);
router.get('/users/:userId', adminUserController.getUserDetails);
router.patch('/users/:userId/status', validateUserStatus, adminUserController.updateUserStatus);

// ==================== ITEM MODERATION ====================
router.get('/items', adminItemController.listItems);
router.get('/items/:itemId', adminItemController.getItemDetails);
router.patch('/items/:itemId/review', validateItemReview, adminItemController.reviewItem);
router.patch('/items/:itemId/status', adminItemController.updateItemStatus);

// ==================== CLAIM VERIFICATION ====================
router.get('/claims', adminClaimController.listClaims);
router.get('/claims/:claimId', adminClaimController.getClaimDetails);
router.patch('/claims/:claimId/review', validateClaimReview, adminClaimController.reviewClaim);

// ==================== CATEGORIES ====================
router.get('/categories', adminCategoryController.listCategories);
router.post('/categories', validateCategoryCreate, adminCategoryController.createCategory);
router.patch('/categories/:categoryId', validateCategoryUpdate, adminCategoryController.updateCategory);

// ==================== AI MATCHES ====================
router.get('/ai-matches', adminAIMatchController.listAIMatches);
router.patch('/ai-matches/:matchId/review', validateAIMatchReview, adminAIMatchController.reviewAIMatch);

// ==================== COMPLAINTS & REPORTS ====================
router.get('/reports', adminReportController.listReports);
router.get('/reports/:reportId', adminReportController.getReportDetails);
router.patch('/reports/:reportId/review', validateReportReview, adminReportController.reviewReport);

// ==================== ACTIVITY LOGS ====================
router.get('/activity-logs', adminActivityLogController.listActivityLogs);
router.get('/activity-logs/export', adminActivityLogController.exportActivityLogs);

// ==================== SYSTEM SETTINGS ====================
router.get('/settings', adminSettingsController.listSettings);
router.patch('/settings/:key', validateSettingUpdate, adminSettingsController.updateSetting);

export default router;
