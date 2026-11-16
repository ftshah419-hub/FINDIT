const { Item } = require('../models');
const { ITEM_STATUS } = require('../constants');
const { logActivity } = require('./activityLogService');
const { createNotification } = require('./notificationService');

/**
 * Fetch paginated items with comprehensive filters
 */
const getItems = async ({
  page = 1,
  limit = 10,
  type, // 'LOST' or 'FOUND'
  status, // 'PENDING', 'APPROVED', 'REJECTED', 'RESOLVED'
  categoryId,
  search = '',
  depot,
  startDate,
  endDate,
}) => {
  const query = {};

  if (type) {
    query.type = type.toUpperCase();
  }

  if (status && status !== 'all') {
    query.status = status.toUpperCase();
  }

  if (categoryId && categoryId !== 'all') {
    query.categoryId = categoryId;
  }

  if (depot && depot !== 'all') {
    query['location.depot'] = { $regex: depot, $options: 'i' };
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { 'location.building': { $regex: search, $options: 'i' } },
      { 'location.depot': { $regex: search, $options: 'i' } },
    ];
  }

  if (startDate || endDate) {
    query.dateTime = {};
    if (startDate) query.dateTime.$gte = new Date(startDate);
    if (endDate) query.dateTime.$lte = new Date(endDate);
  }

  const skip = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
  const total = await Item.countDocuments(query);
  const items = await Item.find(query)
    .populate('reportedBy', 'name email profileImage phone')
    .populate('categoryId', 'name')
    .populate('reviewedBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  return {
    items,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)) || 1,
    },
  };
};

/**
 * Get detailed item record
 */
const getItemById = async (itemId) => {
  const item = await Item.findById(itemId)
    .populate('reportedBy', 'name email profileImage phone')
    .populate('categoryId', 'name')
    .populate('reviewedBy', 'name email')
    .lean();

  if (!item) {
    const error = new Error('Item report not found.');
    error.statusCode = 404;
    throw error;
  }

  return item;
};

/**
 * Review item report: Approve or Reject
 */
const reviewItem = async (itemId, { status, rejectionReason = '' }, adminUser) => {
  if (![ITEM_STATUS.APPROVED, ITEM_STATUS.REJECTED].includes(status)) {
    const error = new Error("Invalid status. Allowed values are 'APPROVED' or 'REJECTED'.");
    error.statusCode = 400;
    throw error;
  }

  if (status === ITEM_STATUS.REJECTED && !rejectionReason.trim()) {
    const error = new Error('A rejection reason is required when rejecting an item report.');
    error.statusCode = 400;
    throw error;
  }

  const item = await Item.findById(itemId);
  if (!item) {
    const error = new Error('Item report not found.');
    error.statusCode = 404;
    throw error;
  }

  const previousStatus = item.status;
  item.status = status;
  item.reviewedBy = adminUser._id;
  if (status === ITEM_STATUS.REJECTED) {
    item.rejectionReason = rejectionReason;
  } else {
    item.rejectionReason = '';
  }

  await item.save();

  // Create audit log
  await logActivity({
    actorId: adminUser._id,
    action: status === ITEM_STATUS.APPROVED ? 'ITEM_REPORT_APPROVED' : 'ITEM_REPORT_REJECTED',
    entityType: 'Item',
    entityId: item._id,
    description: `Administrator ${adminUser.name} ${status.toLowerCase()} ${item.type.toLowerCase()} report: "${item.title}".${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`,
    metadata: { previousStatus, newStatus: status, rejectionReason, itemType: item.type },
  });

  // Dispatch notification to user who reported the item
  await createNotification({
    recipientId: item.reportedBy,
    title: `Your ${item.type} report has been ${status.toLowerCase()}`,
    message:
      status === ITEM_STATUS.APPROVED
        ? `Your report for "${item.title}" has been approved and is now visible in the catalog.`
        : `Your report for "${item.title}" was rejected. Reason: ${rejectionReason}`,
    type: status === ITEM_STATUS.APPROVED ? 'ITEM_APPROVED' : 'ITEM_REJECTED',
    relatedItemId: item._id,
  });

  return item;
};

/**
 * Update item status directly (e.g. mark as RESOLVED)
 */
const updateItemStatus = async (itemId, { status }, adminUser) => {
  const item = await Item.findById(itemId);
  if (!item) {
    const error = new Error('Item report not found.');
    error.statusCode = 404;
    throw error;
  }

  const previousStatus = item.status;
  item.status = status;
  if (status === ITEM_STATUS.RESOLVED) {
    item.resolvedAt = new Date();
  }
  await item.save();

  await logActivity({
    actorId: adminUser._id,
    action: 'ITEM_STATUS_UPDATED',
    entityType: 'Item',
    entityId: item._id,
    description: `Administrator ${adminUser.name} marked "${item.title}" as ${status}.`,
    metadata: { previousStatus, newStatus: status },
  });

  return item;
};

module.exports = {
  getItems,
  getItemById,
  reviewItem,
  updateItemStatus,
};
