import { Claim } from '../models/Claim.js';
import { Item } from '../models/Item.js';
import { Notification } from '../models/Notification.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { CLAIM_STATUS, ITEM_STATUS, ITEM_TYPES, NOTIFICATION_TYPES } from '../constants/index.js';

export const claimService = {
  async submitClaim(itemId, userId, claimData) {
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

    // Check for existing active claim
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
      proofDescription: claimData.proofDescription,
      identifyingDetails: claimData.identifyingDetails || '',
      evidence: claimData.evidence || [],
      status: CLAIM_STATUS.PENDING,
    });

    // Notify user
    await Notification.create({
      recipientId: userId,
      title: 'Ownership Claim Dossier Created',
      message: `Your ownership claim for "${item.title}" (#CLM-${claim._id.toString().slice(-4).toUpperCase()}) was filed and assigned to campus security review.`,
      type: NOTIFICATION_TYPES.CLAIM_SUBMITTED,
      relatedItemId: item._id,
      relatedClaimId: claim._id,
    });

    // Log Activity
    await ActivityLog.create({
      actorId: userId,
      action: 'CLAIM_SUBMITTED',
      entityType: 'Claim',
      entityId: claim._id,
      description: `Submitted ownership claim on item: ${item.title}`,
    });

    return claim;
  },

  async getUserClaims(userId) {
    const claims = await Claim.find({ claimantId: userId })
      .populate({
        path: 'itemId',
        populate: { path: 'categoryId', select: 'name slug' },
      })
      .sort({ createdAt: -1 });

    // Compute metrics
    const total = claims.length;
    const pending = claims.filter((c) => c.status === CLAIM_STATUS.PENDING).length;
    const approved = claims.filter((c) => c.status === CLAIM_STATUS.APPROVED).length;
    const resolved = claims.filter(
      (c) => c.status === CLAIM_STATUS.APPROVED && c.itemId?.status === ITEM_STATUS.RESOLVED
    ).length;

    // Attach computed stepper stages
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
  },

  async getClaimById(claimId, userId) {
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
  },

  async withdrawClaim(claimId, userId) {
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
  },
};
