export const validateUserStatus = (req, res, next) => {
  const { isActive, reason } = req.body;
  if (typeof isActive !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: 'isActive must be a boolean value.',
      errorCode: 'VALIDATION_ERROR',
    });
  }
  if (reason !== undefined && typeof reason !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'reason must be a string.',
      errorCode: 'VALIDATION_ERROR',
    });
  }
  next();
};

export const validateItemReview = (req, res, next) => {
  const { status, rejectionReason } = req.body;
  if (!['APPROVED', 'REJECTED'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Status must be either 'APPROVED' or 'REJECTED'.",
      errorCode: 'VALIDATION_ERROR',
    });
  }
  if (status === 'REJECTED' && (!rejectionReason || !rejectionReason.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Rejection reason is required when rejecting an item.',
      errorCode: 'VALIDATION_ERROR',
    });
  }
  next();
};

export const validateClaimReview = (req, res, next) => {
  const { status, adminNote } = req.body;
  if (!['APPROVED', 'REJECTED'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Status must be either 'APPROVED' or 'REJECTED'.",
      errorCode: 'VALIDATION_ERROR',
    });
  }
  if (adminNote !== undefined && typeof adminNote !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'adminNote must be a string.',
      errorCode: 'VALIDATION_ERROR',
    });
  }
  next();
};

export const validateCategoryCreate = (req, res, next) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 60) {
    return res.status(400).json({
      success: false,
      message: 'Category name is required and must be between 2 and 60 characters.',
      errorCode: 'VALIDATION_ERROR',
    });
  }
  next();
};

export const validateCategoryUpdate = (req, res, next) => {
  const { name, isActive } = req.body;
  if (name !== undefined && (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 60)) {
    return res.status(400).json({
      success: false,
      message: 'Category name must be between 2 and 60 characters.',
      errorCode: 'VALIDATION_ERROR',
    });
  }
  if (isActive !== undefined && typeof isActive !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: 'isActive must be a boolean value.',
      errorCode: 'VALIDATION_ERROR',
    });
  }
  next();
};

export const validateReportReview = (req, res, next) => {
  const { status } = req.body;
  if (!['PENDING', 'REVIEWED', 'DISMISSED', 'RESOLVED'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid complaint status.',
      errorCode: 'VALIDATION_ERROR',
    });
  }
  next();
};

export const validateAIMatchReview = (req, res, next) => {
  const { action } = req.body;
  if (!['CONFIRM', 'DISMISS', 'INVESTIGATE'].includes(action)) {
    return res.status(400).json({
      success: false,
      message: "Action must be 'CONFIRM', 'DISMISS', or 'INVESTIGATE'.",
      errorCode: 'VALIDATION_ERROR',
    });
  }
  next();
};

export const validateSettingUpdate = (req, res, next) => {
  const { value } = req.body;
  if (value === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Setting value is required.',
      errorCode: 'VALIDATION_ERROR',
    });
  }
  next();
};

export default {
  validateUserStatus,
  validateItemReview,
  validateClaimReview,
  validateCategoryCreate,
  validateCategoryUpdate,
  validateReportReview,
  validateAIMatchReview,
  validateSettingUpdate,
};
