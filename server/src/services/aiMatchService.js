const { AIMatch, Item } = require('../models');
const { AI_MATCH_STATUS } = require('../constants');
const { logActivity } = require('./activityLogService');
const { createNotification } = require('./notificationService');

/**
 * Fetch AI candidate matches with filters
 */
const getAIMatches = async ({ page = 1, limit = 10, status, minScore, search = '' }) => {
  const query = {};

  if (status && status !== 'all') {
    query.status = status.toUpperCase();
  }

  if (minScore) {
    query.similarityScore = { $gte: parseFloat(minScore) };
  }

  const skip = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
  const total = await AIMatch.countDocuments(query);

  const matches = await AIMatch.find(query)
    .populate({
      path: 'lostItemId',
      populate: [
        { path: 'categoryId', select: 'name' },
        { path: 'reportedBy', select: 'name email profileImage' },
      ],
    })
    .populate({
      path: 'foundItemId',
      populate: [
        { path: 'categoryId', select: 'name' },
        { path: 'reportedBy', select: 'name email profileImage' },
      ],
    })
    .populate('reviewedBy', 'name email')
    .sort({ similarityScore: -1, createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  return {
    matches,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)) || 1,
    },
  };
};

/**
 * Review AI candidate match (CONFIRM, DISMISS, INVESTIGATE)
 */
const reviewAIMatch = async (matchId, { action, notes = '' }, adminUser) => {
  const actionStatusMap = {
    CONFIRM: AI_MATCH_STATUS.CONFIRMED,
    DISMISS: AI_MATCH_STATUS.DISMISSED,
    INVESTIGATE: AI_MATCH_STATUS.REVIEWED,
  };

  const newStatus = actionStatusMap[action?.toUpperCase()];
  if (!newStatus) {
    const error = new Error("Invalid action. Must be 'CONFIRM', 'DISMISS', or 'INVESTIGATE'.");
    error.statusCode = 400;
    throw error;
  }

  const match = await AIMatch.findById(matchId)
    .populate('lostItemId')
    .populate('foundItemId');

  if (!match) {
    const error = new Error('AI Match record not found.');
    error.statusCode = 404;
    throw error;
  }

  match.status = newStatus;
  match.reviewedBy = adminUser._id;
  await match.save();

  // If confirmed, notify the owner of the lost item that a potential match has been validated
  if (newStatus === AI_MATCH_STATUS.CONFIRMED && match.lostItemId?.reportedBy) {
    await createNotification({
      recipientId: match.lostItemId.reportedBy,
      title: 'Potential Match Verified by Staff!',
      message: `Administration verified an AI match for your lost item "${match.lostItemId.title}" against a cataloged found item. You may inspect and submit a claim.`,
      type: 'AI_MATCH',
      relatedItemId: match.foundItemId?._id,
    });
  }

  await logActivity({
    actorId: adminUser._id,
    action: `AI_MATCH_${action.toUpperCase()}`,
    entityType: 'AIMatch',
    entityId: match._id,
    description: `Administrator ${adminUser.name} marked AI match between "${match.lostItemId?.title}" and "${match.foundItemId?.title}" (${match.similarityScore}%) as ${newStatus}.${notes ? ` Notes: ${notes}` : ''}`,
    metadata: {
      lostItemId: match.lostItemId?._id,
      foundItemId: match.foundItemId?._id,
      similarityScore: match.similarityScore,
      action,
      notes,
    },
  });

  return match;
};

module.exports = {
  getAIMatches,
  reviewAIMatch,
};
