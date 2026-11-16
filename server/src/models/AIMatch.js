const mongoose = require('mongoose');

const aiMatchSchema = new mongoose.Schema(
  {
    lostItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
      index: true,
    },
    foundItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
      index: true,
    },
    similarityScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      index: true,
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    matchingFeatures: {
      type: [String],
      default: [],
    },
    differences: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['PENDING', 'REVIEWED', 'DISMISSED', 'CONFIRMED'],
      default: 'PENDING',
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  }
);

aiMatchSchema.index({ lostItemId: 1, foundItemId: 1 }, { unique: true });

const AIMatch = mongoose.model('AIMatch', aiMatchSchema);

module.exports = AIMatch;
