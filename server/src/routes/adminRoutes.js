const express = require('express');
const router = express.Router();

const { authenticate, authorize } = require('../middlewares/auth');
const adminDashboardController = require('../controllers/adminDashboardController');
const adminUserController = require('../controllers/adminUserController');
const adminItemController = require('../controllers/adminItemController');
const adminClaimController = require('../controllers/adminClaimController');
const adminCategoryController = require('../controllers/adminCategoryController');
const adminAIMatchController = require('../controllers/adminAIMatchController');
const adminReportController = require('../controllers/adminReportController');
const adminActivityLogController = require('../controllers/adminActivityLogController');
const adminSettingsController = require('../controllers/adminSettingsController');

const {
  validateUserStatus,
  validateItemReview,
  validateClaimReview,
  validateCategoryCreate,
  validateCategoryUpdate,
  validateReportReview,
  validateAIMatchReview,
  validateSettingUpdate,
} = require('../validators/adminValidators');

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

module.exports = router;
