import mongoose from 'mongoose';
import { ITEM_TYPES, ITEM_STATUS } from '../constants/index.js';

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
    isPrimary: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    campusZone: {
      type: String,
      trim: true,
      default: 'Main Campus',
    },
    room: {
      type: String,
      trim: true,
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
    },
    title: {
      type: String,
      required: [true, 'Item title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
      index: true,
    },
    brand: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    distinctiveFeatures: {
      type: String,
      trim: true,
      default: '',
    },
    type: {
      type: String,
      enum: Object.values(ITEM_TYPES),
      required: true,
      index: true,
    },
    location: {
      type: locationSchema,
      required: true,
    },
    itemDate: {
      type: Date,
      required: [true, 'Date is required'],
      index: true,
    },
    approximateTime: {
      type: String,
      default: '',
    },
    condition: {
      type: String,
      enum: ['brand_new', 'good', 'worn', 'damaged', 'unknown'],
      default: 'good',
    },
    storageLocation: {
      type: String,
      trim: true,
      default: 'Main Security Desk',
    },
    serialNumber: {
      type: String,
      trim: true,
      default: '',
      select: false, // Hidden by default for privacy
    },
    hideContactInfo: {
      type: Boolean,
      default: true,
    },
    images: {
      type: [imageSchema],
      default: [],
    },
    status: {
      type: String,
      enum: Object.values(ITEM_STATUS),
      default: ITEM_STATUS.PENDING,
      index: true,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    reviewedAt: {
      type: Date,
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Full text search index
itemSchema.index({
  title: 'text',
  description: 'text',
  distinctiveFeatures: 'text',
  brand: 'text',
  'location.name': 'text',
});

// Composite indexes for fast filtered browsing
itemSchema.index({ status: 1, type: 1, createdAt: -1 });
itemSchema.index({ status: 1, categoryId: 1, createdAt: -1 });

export const Item = mongoose.model('Item', itemSchema);
