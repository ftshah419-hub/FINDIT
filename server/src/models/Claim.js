import mongoose from 'mongoose';
import { CLAIM_STATUS } from '../constants/index.js';

const evidenceSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      default: '',
    },
    name: {
      type: String,
      default: 'Evidence File',
    },
  },
  { _id: false }
);

const claimSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
      index: true,
    },
    claimantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    proofDescription: {
      type: String,
      required: [true, 'Proof description is required'],
      trim: true,
    },
    identifyingDetails: {
      type: String,
      trim: true,
      default: '',
    },
    evidence: {
      type: [evidenceSchema],
      default: [],
    },
    status: {
      type: String,
      enum: Object.values(CLAIM_STATUS),
      default: CLAIM_STATUS.PENDING,
      index: true,
    },
    adminNote: {
      type: String,
      default: '',
    },
    pickupPassCode: {
      type: String,
      default: '',
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent active duplicate claims by the same claimant on the same item
claimSchema.index(
  { itemId: 1, claimantId: 1, status: 1 },
  { name: 'unique_active_claim' }
);

export const Claim = mongoose.model('Claim', claimSchema);
