const { ActivityLog } = require('../models');

/**
 * Record an administrative activity log entry
 * @param {Object} params
 * @param {string|ObjectId} params.actorId
 * @param {string} params.action
 * @param {string} params.entityType
 * @param {string|ObjectId} [params.entityId]
 * @param {string} params.description
 * @param {Object} [params.metadata]
 */
const logActivity = async ({ actorId, action, entityType, entityId = null, description, metadata = {} }) => {
  try {
    const log = await ActivityLog.create({
      actorId,
      action,
      entityType,
      entityId,
      description,
      metadata,
    });
    return log;
  } catch (error) {
    console.error('[ActivityLog Error] Failed to write log:', error.message);
    // Non-blocking so audit failures do not break critical user operations
    return null;
  }
};

/**
 * Fetch paginated activity logs
 */
const getActivityLogs = async ({ page = 1, limit = 20, action, entityType, actorId, startDate, endDate }) => {
  const query = {};

  if (action) {
    query.action = action;
  }
  if (entityType) {
    query.entityType = entityType;
  }
  if (actorId) {
    query.actorId = actorId;
  }
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const skip = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
  const total = await ActivityLog.countDocuments(query);
  const logs = await ActivityLog.find(query)
    .populate('actorId', 'name email role profileImage')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  return {
    logs,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)) || 1,
    },
  };
};

module.exports = {
  logActivity,
  getActivityLogs,
};
