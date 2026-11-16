const { body, param, query } = require('express-validator');
const { validate } = require('../middlewares/errorHandler');

const validateUserStatus = [
  body('isActive').isBoolean().withMessage('isActive must be a boolean value.'),
  body('reason').optional().isString().trim(),
  validate,
];

const validateItemReview = [
  body('status')
    .isIn(['APPROVED', 'REJECTED'])
    .withMessage("Status must be either 'APPROVED' or 'REJECTED'."),
  body('rejectionReason')
    .if(body('status').equals('REJECTED'))
    .notEmpty()
    .withMessage('Rejection reason is required when rejecting an item.')
    .trim(),
  validate,
];

const validateClaimReview = [
  body('status')
    .isIn(['APPROVED', 'REJECTED'])
    .withMessage("Status must be either 'APPROVED' or 'REJECTED'."),
  body('adminNote').optional().isString().trim(),
  validate,
];

const validateCategoryCreate = [
  body('name')
    .notEmpty()
    .withMessage('Category name is required.')
    .isLength({ min: 2, max: 60 })
    .withMessage('Category name must be between 2 and 60 characters.')
    .trim(),
  body('description').optional().isString().trim(),
  validate,
];

const validateCategoryUpdate = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 60 })
    .withMessage('Category name must be between 2 and 60 characters.')
    .trim(),
  body('description').optional().isString().trim(),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean value.'),
  validate,
];

const validateReportReview = [
  body('status')
    .isIn(['PENDING', 'REVIEWED', 'DISMISSED', 'RESOLVED'])
    .withMessage('Invalid complaint status.'),
  body('adminNote').optional().isString().trim(),
  validate,
];

const validateAIMatchReview = [
  body('action')
    .isIn(['CONFIRM', 'DISMISS', 'INVESTIGATE'])
    .withMessage("Action must be 'CONFIRM', 'DISMISS', or 'INVESTIGATE'."),
  body('notes').optional().isString().trim(),
  validate,
];

const validateSettingUpdate = [
  body('value').exists().withMessage('Setting value is required.'),
  body('description').optional().isString().trim(),
  validate,
];

module.exports = {
  validateUserStatus,
  validateItemReview,
  validateClaimReview,
  validateCategoryCreate,
  validateCategoryUpdate,
  validateReportReview,
  validateAIMatchReview,
  validateSettingUpdate,
};
