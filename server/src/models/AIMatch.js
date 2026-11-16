import mongoose from 'mongoose';

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
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    matchingFeatures: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['PENDING', 'VIEWED', 'DISMISSED', 'CLAIMED'],
      default: 'PENDING',
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

aiMatchSchema.index({ lostItemId: 1, foundItemId: 1 }, { unique: true });

export const AIMatch = mongoose.model('AIMatch', aiMatchSchema);
