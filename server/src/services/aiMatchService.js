import { AIMatch } from '../models/AIMatch.js';
import { Item } from '../models/Item.js';
import { Notification } from '../models/Notification.js';
import { logActivity } from './activityLogService.js';
import { NOTIFICATION_TYPES, ITEM_STATUS, ITEM_TYPES, AI_MATCH_STATUS } from '../constants/index.js';

export const calculateScore = (lostItem, foundItem) => {
  let score = 0;
  const features = [];

  // 1. Category check (35 points)
  if (lostItem.categoryId && foundItem.categoryId && lostItem.categoryId.toString() === foundItem.categoryId.toString()) {
    score += 35;
    features.push('Category Match 100%');
  }

  // 2. Title & Keywords overlap (up to 35 points)
  const lostTokens = (lostItem.title + ' ' + (lostItem.description || '') + ' ' + (lostItem.distinctiveFeatures || ''))
    .toLowerCase()
    .split(/[\s,\-_/]+/)
    .filter((w) => w.length > 2);

  const foundTokens = (foundItem.title + ' ' + (foundItem.description || '') + ' ' + (foundItem.distinctiveFeatures || ''))
    .toLowerCase()
    .split(/[\s,\-_/]+/)
    .filter((w) => w.length > 2);

  const lostSet = new Set(lostTokens);
  let matchedWords = 0;
  foundTokens.forEach((t) => {
    if (lostSet.has(t)) matchedWords++;
  });

  if (lostTokens.length > 0) {
    const tokenRatio = Math.min(matchedWords / Math.min(lostTokens.length, 6), 1);
    const tokenScore = Math.round(tokenRatio * 35);
    score += tokenScore;
    if (tokenScore > 15) {
      features.push(`Keyword & Descriptor Overlap ${Math.min(98, Math.round(tokenRatio * 100))}%`);
    }
  }

  // 3. Brand Matching (up to 15 points)
  if (lostItem.brand && foundItem.brand) {
    if (lostItem.brand.toLowerCase() === foundItem.brand.toLowerCase()) {
      score += 15;
      features.push('Brand & Model Verification 98%');
    }
  } else if (lostItem.brand && foundItem.title?.toLowerCase().includes(lostItem.brand.toLowerCase())) {
    score += 12;
    features.push('Brand Match 90%');
  }

  // 4. Location Proximity (up to 15 points)
  const lostLoc = (lostItem.location?.name || '').toLowerCase();
  const foundLoc = (foundItem.location?.name || '').toLowerCase();
  const lostZone = (lostItem.location?.campusZone || '').toLowerCase();
  const foundZone = (foundItem.location?.campusZone || '').toLowerCase();

  if (lostZone && foundZone && lostZone === foundZone) {
    score += 10;
    features.push('Campus Zone Proximity 90%');
    if (lostLoc && foundLoc && (lostLoc.includes(foundLoc) || foundLoc.includes(lostLoc))) {
      score += 5;
      features.push('Specific Facility Anchor Match');
    }
  } else if (lostLoc && foundLoc && (lostLoc.includes(foundLoc) || foundLoc.includes(lostLoc))) {
    score += 12;
    features.push('Location Match 85%');
  }

  return {
    score: Math.min(100, Math.max(score, 0)),
    features: features.length > 0 ? features : ['General Visual & Descriptor Alignment'],
  };
};

export const scanAndGenerateMatches = async (item) => {
  try {
    if (item.type === ITEM_TYPES.LOST) {
      const foundItems = await Item.find({
        type: ITEM_TYPES.FOUND,
        status: { $in: [ITEM_STATUS.APPROVED, ITEM_STATUS.PENDING] },
      });

      for (const found of foundItems) {
        const { score, features } = calculateScore(item, found);
        if (score >= 60) {
          await AIMatch.findOneAndUpdate(
            { lostItemId: item._id, foundItemId: found._id },
            {
              similarityScore: score,
              confidence: score,
              matchingFeatures: features,
              status: 'PENDING',
            },
            { upsert: true, new: true }
          );

          if (score >= 80) {
            await Notification.create({
              recipientId: item.reportedBy,
              title: 'High-Confidence AI Smart Match Identified',
              message: `FINDIT AI Radar found a ${score}% match between your reported '${item.title}' and new Found Item #${found._id.toString().slice(-4).toUpperCase()}.`,
              type: NOTIFICATION_TYPES.AI_MATCH_FOUND,
              relatedItemId: found._id,
            });
          }
        }
      }
    } else if (item.type === ITEM_TYPES.FOUND) {
      const lostItems = await Item.find({
        type: ITEM_TYPES.LOST,
        status: { $in: [ITEM_STATUS.PENDING, ITEM_STATUS.APPROVED] },
      });

      for (const lost of lostItems) {
        const { score, features } = calculateScore(lost, item);
        if (score >= 60) {
          await AIMatch.findOneAndUpdate(
            { lostItemId: lost._id, foundItemId: item._id },
            {
              similarityScore: score,
              confidence: score,
              matchingFeatures: features,
              status: 'PENDING',
            },
            { upsert: true, new: true }
          );

          if (score >= 80) {
            await Notification.create({
              recipientId: lost.reportedBy,
              title: 'High-Confidence AI Smart Match Identified',
              message: `FINDIT AI Radar found a ${score}% match between your reported lost item and newly logged Found Item #${item._id.toString().slice(-4).toUpperCase()}.`,
              type: NOTIFICATION_TYPES.AI_MATCH_FOUND,
              relatedItemId: item._id,
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('Error generating AI matches:', error);
  }
};

export const getUserMatches = async (userId) => {
  const userLostItems = await Item.find({
    reportedBy: userId,
    type: ITEM_TYPES.LOST,
  }).select('_id title itemDate location images status brand');

  const lostItemIds = userLostItems.map((i) => i._id);

  const matches = await AIMatch.find({
    lostItemId: { $in: lostItemIds },
    status: { $ne: 'DISMISSED' },
  })
    .populate({
      path: 'lostItemId',
      populate: { path: 'categoryId', select: 'name' },
    })
    .populate({
      path: 'foundItemId',
      populate: { path: 'categoryId', select: 'name' },
    })
    .sort({ similarityScore: -1 });

  return {
    userLostItems,
    matches,
  };
};

export const dismissMatch = async (matchId, userId) => {
  const match = await AIMatch.findById(matchId).populate('lostItemId');
  if (!match) {
    throw new Error('AI match record not found');
  }
  if (match.lostItemId.reportedBy.toString() !== userId.toString()) {
    throw new Error('You do not have permission to dismiss this match');
  }
  match.status = 'DISMISSED';
  await match.save();
  return match;
};

// Admin Methods
export const getAIMatches = async ({ page = 1, limit = 10, status, minScore, search = '' } = {}) => {
  const query = {};

  if (status && status !== 'all') {
    query.status = status.toUpperCase();
  }

  if (minScore) {
    query.similarityScore = { $gte: parseFloat(minScore) };
  }

  const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
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
    .limit(parseInt(limit, 10))
    .lean();

  return {
    matches,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)) || 1,
    },
  };
};

export const reviewAIMatch = async (matchId, { action, notes = '' }, adminUser) => {
  const actionStatusMap = {
    CONFIRM: AI_MATCH_STATUS?.CONFIRMED || 'CONFIRMED',
    DISMISS: AI_MATCH_STATUS?.DISMISSED || 'DISMISSED',
    INVESTIGATE: AI_MATCH_STATUS?.REVIEWED || 'REVIEWED',
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
  match.reviewedBy = adminUser?._id;
  await match.save();

  if (newStatus === 'CONFIRMED' && match.lostItemId?.reportedBy) {
    await Notification.create({
      recipientId: match.lostItemId.reportedBy,
      title: 'Potential Match Verified by Staff!',
      message: `Administration verified an AI match for your lost item "${match.lostItemId.title}" against a cataloged found item. You may inspect and submit a claim.`,
      type: NOTIFICATION_TYPES.AI_MATCH_FOUND,
      relatedItemId: match.foundItemId?._id,
    });
  }

  if (adminUser?._id) {
    await logActivity({
      actorId: adminUser._id,
      action: `AI_MATCH_${action.toUpperCase()}`,
      entityType: 'AIMatch',
      entityId: match._id,
      description: `Administrator ${adminUser.name || 'Admin'} marked AI match between "${match.lostItemId?.title}" and "${match.foundItemId?.title}" (${match.similarityScore}%) as ${newStatus}.${notes ? ` Notes: ${notes}` : ''}`,
      metadata: {
        lostItemId: match.lostItemId?._id,
        foundItemId: match.foundItemId?._id,
        similarityScore: match.similarityScore,
        action,
        notes,
      },
    });
  }

  return match;
};

export const aiMatchService = {
  calculateScore,
  scanAndGenerateMatches,
  getUserMatches,
  dismissMatch,
  getAIMatches,
  reviewAIMatch,
};

export default aiMatchService;
