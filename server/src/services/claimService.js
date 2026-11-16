import { Claim } from '../models/Claim.js';
import { Item } from '../models/Item.js';
import { Notification } from '../models/Notification.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { logActivity } from './activityLogService.js';
import { CLAIM_STATUS, ITEM_STATUS, ITEM_TYPES, NOTIFICATION_TYPES } from '../constants/index.js';

// User Methods
export const submitClaim = async (itemId, userId, claimData) => {
  const item = await Item.findById(itemId);
  if (!item) {
    throw new Error('Item not found');
  }

  if (item.type !== ITEM_TYPES.FOUND) {
    throw new Error('Claims can only be filed against found property reports');
  }

  if (item.status !== ITEM_STATUS.APPROVED) {
    throw new Error('Claims can only be submitted for officially approved items');
  }

  if (item.reportedBy.toString() === userId.toString()) {
    throw new Error('You cannot submit an ownership claim for an item you reported as found');
  }

  const existingClaim = await Claim.findOne({
    itemId,
    claimantId: userId,
    status: { $in: [CLAIM_STATUS.PENDING, CLAIM_STATUS.APPROVED] },
  });

  if (existingClaim) {
    throw new Error('You already have an active claim under review for this item');
  }

  const claim = await Claim.create({
    itemId,
    claimantId: userId,
    claimDescription: claimData.claimDescription || claimData.description,
    distinctiveProof: claimData.distinctiveProof || claimData.secretMarks || '',
    evidenceImages: claimData.evidenceImages || [],
    contactPhone: claimData.contactPhone,
    status: CLAIM_STATUS.PENDING,
  });

  await Notification.create({
    recipientId: userId,
    title: 'Claim Successfully Submitted',
    message: `Your ownership claim for "${item.title}" (#CLM-${claim._id.toString().slice(-4).toUpperCase()}) was recorded and is awaiting administrator verification.`,
    type: NOTIFICATION_TYPES.CLAIM_SUBMITTED,
    relatedItemId: item._id,
    relatedClaimId: claim._id,
  });

  await ActivityLog.create({
    actorId: userId,
    action: 'CLAIM_SUBMITTED',
    entityType: 'Claim',
    entityId: claim._id,
    description: `Submitted ownership claim on item: ${item.title}`,
  });

  return claim;
};

export const getUserClaims = async (userId) => {
  const claims = await Claim.find({ claimantId: userId })
    .populate({
      path: 'itemId',
      populate: { path: 'categoryId', select: 'name slug' },
    })
    .sort({ createdAt: -1 });

  const total = claims.length;
  const pending = claims.filter((c) => c.status === CLAIM_STATUS.PENDING).length;
  const approved = claims.filter((c) => c.status === CLAIM_STATUS.APPROVED).length;
  const resolved = claims.filter(
    (c) => c.status === CLAIM_STATUS.APPROVED && c.itemId?.status === ITEM_STATUS.RESOLVED
  ).length;

  const enrichedClaims = claims.map((claim) => {
    const claimObj = claim.toObject();
    let currentStage = 1;
    if (claim.status === CLAIM_STATUS.PENDING) currentStage = 2;
    else if (claim.status === CLAIM_STATUS.APPROVED) {
      currentStage = claim.itemId?.status === ITEM_STATUS.RESOLVED ? 4 : 3;
    }
    claimObj.verificationStage = currentStage;
    return claimObj;
  });

  return {
    claims: enrichedClaims,
    metrics: {
      total,
      underReview: pending,
      readyForPickup: approved - resolved,
      resolvedAndReturned: resolved,
    },
  };
};

export const getUserClaimById = async (claimId, userId) => {
  const claim = await Claim.findById(claimId)
    .populate({
      path: 'itemId',
      populate: { path: 'categoryId', select: 'name slug' },
    })
    .populate('claimantId', 'name email phone');

  if (!claim) {
    throw new Error('Claim dossier not found');
  }

  if (claim.claimantId._id.toString() !== userId.toString()) {
    throw new Error('Access denied to private claim dossier');
  }

  const claimObj = claim.toObject();
  let currentStage = 1;
  if (claim.status === CLAIM_STATUS.PENDING) currentStage = 2;
  else if (claim.status === CLAIM_STATUS.APPROVED) {
    currentStage = claim.itemId?.status === ITEM_STATUS.RESOLVED ? 4 : 3;
  }
  claimObj.verificationStage = currentStage;

  return claimObj;
};

export const withdrawClaim = async (claimId, userId) => {
  const claim = await Claim.findById(claimId);
  if (!claim) {
    throw new Error('Claim not found');
  }

  if (claim.claimantId.toString() !== userId.toString()) {
    throw new Error('You do not have permission to withdraw this claim');
  }

  if (claim.status !== CLAIM_STATUS.PENDING) {
    throw new Error('Only pending claims can be withdrawn');
  }

  claim.status = CLAIM_STATUS.WITHDRAWN;
  await claim.save();

  await ActivityLog.create({
    actorId: userId,
    action: 'CLAIM_WITHDRAWN',
    entityType: 'Claim',
    entityId: claim._id,
    description: `Withdrew claim #CLM-${claim._id.toString().slice(-4).toUpperCase()}`,
  });

  return claim;
};

// Admin Methods
export const getClaims = async ({ page = 1, limit = 10, status, search = '', urgentOnly = false }) => {
  const query = {};

  if (status && status !== 'all') {
    query.status = status.toUpperCase();
  }

  const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);

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
    .limit(parseInt(limit, 10));

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
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)) || 1,
    },
  };
};

export const getClaimById = async (claimId, userId = null) => {
  if (userId) {
    return getUserClaimById(claimId, userId);
  }

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

export const reviewClaim = async (claimId, { status, adminNote = '' }, adminUser) => {
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

  if (status === CLAIM_STATUS.APPROVED) {
    claim.status = CLAIM_STATUS.APPROVED;
    claim.adminNote = adminNote;
    claim.reviewedBy = adminUser?._id;
    claim.resolvedAt = new Date();
    await claim.save();

    item.status = ITEM_STATUS.RESOLVED;
    item.resolvedAt = new Date();
    await item.save();

    // Reject all other pending claims for this item
    await Claim.updateMany(
      { itemId: item._id, _id: { $ne: claim._id }, status: CLAIM_STATUS.PENDING },
      {
        $set: {
          status: CLAIM_STATUS.REJECTED,
          adminNote: 'Item claimed and verified by original owner.',
          reviewedBy: adminUser?._id,
          resolvedAt: new Date(),
        },
      }
    );

    // Notify Claimant
    await Notification.create({
      recipientId: claim.claimantId,
      title: 'Claim Approved! Your item is ready for handover',
      message: `Your claim for "${item.title}" has been verified and approved. Please present identification at ${item.location?.name || 'Central Vault'} to retrieve it.`,
      type: NOTIFICATION_TYPES.CLAIM_APPROVED,
      relatedItemId: item._id,
      relatedClaimId: claim._id,
    });

    // Notify Reporter of Resolution
    if (item.reportedBy) {
      await Notification.create({
        recipientId: item.reportedBy,
        title: 'Found Item Reunited',
        message: `The item "${item.title}" you reported finding has been successfully claimed and verified.`,
        type: NOTIFICATION_TYPES.REPORT_APPROVED,
        relatedItemId: item._id,
      });
    }

    if (adminUser?._id) {
      await logActivity({
        actorId: adminUser._id,
        action: 'CLAIM_APPROVED',
        entityType: 'Claim',
        entityId: claim._id,
        description: `Administrator ${adminUser.name || 'Admin'} approved claim #${claim._id.toString().slice(-6)} for item "${item.title}" to claimant.`,
        metadata: { itemId: item._id, claimantId: claim.claimantId, adminNote },
      });
    }
  } else {
    claim.status = CLAIM_STATUS.REJECTED;
    claim.adminNote = adminNote;
    claim.reviewedBy = adminUser?._id;
    claim.resolvedAt = new Date();
    await claim.save();

    await Notification.create({
      recipientId: claim.claimantId,
      title: 'Claim Review Decision: Rejected',
      message: `Your claim for "${item.title}" was reviewed and rejected.${adminNote ? ` Reason: ${adminNote}` : ''}`,
      type: NOTIFICATION_TYPES.CLAIM_REJECTED,
      relatedItemId: item._id,
    });

    if (adminUser?._id) {
      await logActivity({
        actorId: adminUser._id,
        action: 'CLAIM_REJECTED',
        entityType: 'Claim',
        entityId: claim._id,
        description: `Administrator ${adminUser.name || 'Admin'} rejected claim #${claim._id.toString().slice(-6)} for item "${item.title}".${adminNote ? ` Reason: ${adminNote}` : ''}`,
        metadata: { itemId: item._id, claimantId: claim.claimantId, adminNote },
      });
    }
  }

  return claim;
};

export const claimService = {
  submitClaim,
  getUserClaims,
  getUserClaimById,
  withdrawClaim,
  getClaims,
  getClaimById,
  reviewClaim,
};

export default claimService;
