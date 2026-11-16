import mongoose from 'mongoose';
import { ALL_TOKEN_PURPOSES } from '../constants/purposes.js';

const authTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      select: false, // Do not expose token hash in queries by default
    },
    purpose: {
      type: String,
      enum: {
        values: ALL_TOKEN_PURPOSES,
        message: '{VALUE} is not a valid token purpose',
      },
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxAttempts: {
      type: Number,
      default: 5,
    },
    resendAfter: {
      type: Date,
      required: true,
    },
    consumedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound index for querying active challenges for a user and purpose
authTokenSchema.index({ userId: 1, purpose: 1, consumedAt: 1 });

// TTL index for automatic background cleanup
authTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const AuthToken = mongoose.model('AuthToken', authTokenSchema);
