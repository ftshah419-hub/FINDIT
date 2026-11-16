const mongoose = require('mongoose');
const { Claim, Item } = require('../models');
const { CLAIM_STATUS, ITEM_STATUS } = require('../constants');
const { logActivity } = require('./activityLogService');
const { createNotification } = require('./notificationService');

/**
 * Fetch paginated claims with filters
 */
const getClaims = async ({ page = 1, limit = 10, status, search = '', urgentOnly = false }) => {
  const query = {};

  if (status && status !== 'all') {
    query.status = status.toUpperCase();
  }

  const skip = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);

  // If urgentOnly, we filter for pending claims
  if (urgentOnly === true || urgentOnly === 'true') {
    query.status = CLAIM_STATUS.PENDING;
  }

  const total = await Claim.countDocuments(query);
  let claimsQuery = Claim.find(query)
    .populate('claimantId', 'name email profileImage phone')
    .populate({
      path: 'itemId',
      populate: [
        { path: 'categoryId', select: 'name' },
        { path: 'reportedBy', select: 'name email phone' },
      ],
    })
    .populate('reviewedBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  let claims = await claimsQuery.lean();

  if (search) {
    const s = search.toLowerCase();
    claims = claims.filter(
      (c) =>
        c.claimantId?.name?.toLowerCase().includes(s) ||
        c.claimantId?.email?.toLowerCase().includes(s) ||
        c.itemId?.title?.toLowerCase().includes(s) ||
        c.claimDescription?.toLowerCase().includes(s)
    );
  }

  return {
    claims,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)) || 1,
    },
  };
};

/**
 * Get detailed claim by ID
 */
const getClaimById = async (claimId) => {
  const claim = await Claim.findById(claimId)
    .populate('claimantId', 'name email profileImage phone')
    .populate({
      path: 'itemId',
      populate: [
        { path: 'categoryId', select: 'name' },
        { path: 'reportedBy', select: 'name email profileImage phone' },
      ],
    })
    .populate('reviewedBy', 'name email')
    .lean();

  if (!claim) {
    const error = new Error('Claim not found.');
    error.statusCode = 404;
    throw error;
  }

  // Also fetch any other claims for the same item for administrative context
  const siblingClaims = await Claim.find({
    itemId: claim.itemId?._id,
    _id: { $ne: claim._id },
  })
    .populate('claimantId', 'name email')
    .lean();

  return {
    ...claim,
    siblingClaims,
  };
};

/**
 * Review claim: Approve or Reject
 * Enforces atomic resolution and conflicting claim prevention
 */
const reviewClaim = async (claimId, { status, adminNote = '' }, adminUser) => {
  if (![CLAIM_STATUS.APPROVED, CLAIM_STATUS.REJECTED].includes(status)) {
    const error = new Error("Invalid status. Allowed values are 'APPROVED' or 'REJECTED'.");
    error.statusCode = 400;
    throw error;
  }

  const claim = await Claim.findById(claimId).populate('itemId');
  if (!claim) {
    const error = new Error('Claim not found.');
    error.statusCode = 404;
    throw error;
  }

  if (claim.status !== CLAIM_STATUS.PENDING) {
    const error = new Error(`This claim has already been resolved with status: ${claim.status}.`);
    error.statusCode = 400;
    throw error;
  }

  const item = claim.itemId;
  if (!item) {
    const error = new Error('Associated item record not found.');
    error.statusCode = 404;
    throw error;
  }

  // Ensure user cannot claim their own found item
  if (item.reportedBy && item.reportedBy.toString() === claim.claimantId.toString()) {
    const error = new Error('Fraud prevention: A user cannot claim an item they reported finding.');
    error.statusCode = 400;
    throw error;
  }

  const previousStatus = claim.status;

  if (status === CLAIM_STATUS.APPROVED) {
    // Check if the item is already resolved
    if (item.status === ITEM_STATUS.RESOLVED) {
      const error = new Error('This item has already been marked as resolved with another verified claim.');
      error.statusCode = 400;
      throw error;
    }

    // Atomic update of the claim
    claim.status = CLAIM_STATUS.APPROVED;
    claim.adminNote = adminNote;
    claim.reviewedBy = adminUser._id;
    claim.resolvedAt = new Date();
    await claim.save();

    // Atomically resolve the related item
    await Item.findByIdAndUpdate(item._id, {
      status: ITEM_STATUS.RESOLVED,
      resolvedAt: new Date(),
      reviewedBy: adminUser._id,
    });

    // Reject any other PENDING claims for this item
    await Claim.updateMany(
      {
        itemId: item._id,
        _id: { $ne: claim._id },
        status: CLAIM_STATUS.PENDING,
      },
      {
        status: CLAIM_STATUS.REJECTED,
        adminNote: 'Closed automatically: Another claim was verified and approved by administration.',
        reviewedBy: adminUser._id,
        resolvedAt: new Date(),
      }
    );

    // Notify Claimant of Approval
    await createNotification({
      recipientId: claim.claimantId,
      title: 'Claim Verified & Approved!',
      message: `Your ownership claim for "${item.title}" was approved by administrator ${adminUser.name}. Please proceed to the designated custody depot to collect your item.`,
      type: 'CLAIM_APPROVED',
      relatedItemId: item._id,
    });

    // Notify Reporter of Resolution
    if (item.reportedBy) {
      await createNotification({
        recipientId: item.reportedBy,
        title: 'Found Item Reunited',
        message: `The item "${item.title}" you reported finding has been successfully claimed and verified.`,
        type: 'ITEM_APPROVED',
        relatedItemId: item._id,
      });
    }

    // Log Activity
    await logActivity({
      actorId: adminUser._id,
      action: 'CLAIM_APPROVED',
      entityType: 'Claim',
      entityId: claim._id,
      description: `Administrator ${adminUser.name} approved claim #${claim._id.toString().slice(-6)} for item "${item.title}" to claimant.`,
      metadata: { itemId: item._id, claimantId: claim.claimantId, adminNote },
    });
  } else {
    // Reject claim
    claim.status = CLAIM_STATUS.REJECTED;
    claim.adminNote = adminNote;
    claim.reviewedBy = adminUser._id;
    claim.resolvedAt = new Date();
    await claim.save();

    // Notify Claimant of Rejection
    await createNotification({
      recipientId: claim.claimantId,
      title: 'Claim Review Decision: Rejected',
      message: `Your claim for "${item.title}" was reviewed and rejected.${adminNote ? ` Reason: ${adminNote}` : ''}`,
      type: 'CLAIM_REJECTED',
      relatedItemId: item._id,
    });

    // Log Activity
    await logActivity({
      actorId: adminUser._id,
      action: 'CLAIM_REJECTED',
      entityType: 'Claim',
      entityId: claim._id,
      description: `Administrator ${adminUser.name} rejected claim #${claim._id.toString().slice(-6)} for item "${item.title}".${adminNote ? ` Reason: ${adminNote}` : ''}`,
      metadata: { itemId: item._id, claimantId: claim.claimantId, adminNote },
    });
  }

  return claim;
};

module.exports = {
  getClaims,
  getClaimById,
  reviewClaim,
};
