const mongoose = require('mongoose');

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
      select: false,
    },
    purpose: {
      type: String,
      enum: ['EMAIL_VERIFICATION', 'LOGIN', 'PASSWORD_RESET', 'PASSWORD_RESET_GRANT'],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index auto-deletes expired tokens
    },
    attempts: {
      type: Number,
      default: 0,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    resendAfter: {
      type: Date,
    },
    consumedAt: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const AuthToken = mongoose.model('AuthToken', authTokenSchema);

module.exports = AuthToken;
