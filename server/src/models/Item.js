const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const locationSchema = new mongoose.Schema(
  {
    depot: {
      type: String,
      default: '',
    },
    building: {
      type: String,
      default: '',
    },
    room: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  { _id: false }
);

const itemSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      index: 'text',
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['LOST', 'FOUND'],
      required: true,
      index: true,
    },
    location: {
      type: locationSchema,
      default: () => ({}),
    },
    dateTime: {
      type: Date,
      default: Date.now,
    },
    images: {
      type: [imageSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'RESOLVED'],
      default: 'PENDING',
      index: true,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for high-frequency queries
itemSchema.index({ type: 1, status: 1, createdAt: -1 });
itemSchema.index({ categoryId: 1, status: 1 });

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
