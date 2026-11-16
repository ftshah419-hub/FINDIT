const mongoose = require('mongoose');

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
    type: {
      type: String,
      enum: ['IMAGE', 'RECEIPT', 'SERIAL_DOC', 'AFFIDAVIT', 'OTHER'],
      default: 'IMAGE',
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
      default: null,
    },
    claimDescription: {
      type: String,
      required: true,
      trim: true,
    },
    evidence: {
      type: [evidenceSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN'],
      default: 'PENDING',
      index: true,
    },
    adminNote: {
      type: String,
      default: '',
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  }
);

claimSchema.index({ itemId: 1, status: 1 });
claimSchema.index({ claimantId: 1, status: 1 });

const Claim = mongoose.model('Claim', claimSchema);

module.exports = Claim;
