import mongoose from 'mongoose';
import { Item } from '../models/Item.js';
import { Category } from '../models/Category.js';
import { Notification } from '../models/Notification.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { aiMatchService } from './aiMatchService.js';
import { ITEM_STATUS, ITEM_TYPES, NOTIFICATION_TYPES } from '../constants/index.js';

export const itemService = {
  async createItem(itemData, userId) {
    let resolvedCategoryId = itemData.categoryId;
    if (!resolvedCategoryId && itemData.category) {
      let cat = null;
      if (mongoose.Types.ObjectId.isValid(itemData.category)) {
        cat = await Category.findById(itemData.category);
      }
      if (!cat) {
        cat = await Category.findOne({
          $or: [
            { name: { $regex: new RegExp(`^${itemData.category}$`, 'i') } },
            { slug: itemData.category.toLowerCase() },
          ],
        });
      }
      if (!cat) {
        cat = await Category.create({ name: itemData.category });
      }
      resolvedCategoryId = cat._id;
    }

    if (!resolvedCategoryId) {
      const firstCat = await Category.findOne({ isActive: true });
      if (firstCat) resolvedCategoryId = firstCat._id;
    }

    const resolvedDate = itemData.itemDate || itemData.dateLostOrFound || itemData.date || new Date();

    let resolvedLocation = itemData.location || {};
    if (typeof resolvedLocation === 'string') {
      resolvedLocation = { name: resolvedLocation, campusZone: itemData.campusZone || 'Main Campus' };
    } else {
      resolvedLocation = {
        name: resolvedLocation.name || resolvedLocation.specificArea || itemData.locationName || 'Campus General Area',
        campusZone: resolvedLocation.campusZone || itemData.campusZone || 'Main Campus',
        room: resolvedLocation.room || '',
        coordinates: resolvedLocation.coordinates,
      };
    }

    let resolvedImages = itemData.images || [];
    if (resolvedImages.length === 0) {
      resolvedImages = [
        {
          url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
          publicId: 'placeholder',
          isPrimary: true,
        },
      ];
    }

    const item = await Item.create({
      ...itemData,
      categoryId: resolvedCategoryId,
      itemDate: resolvedDate,
      location: resolvedLocation,
      images: resolvedImages,
      reportedBy: userId,
      status: ITEM_STATUS.PENDING,
    });

    // Notify user of successful submission
    await Notification.create({
      recipientId: userId,
      title: `${item.type === ITEM_TYPES.LOST ? 'Lost' : 'Found'} Item Report Submitted`,
      message: `Your report for "${item.title}" (#${item._id.toString().slice(-4).toUpperCase()}) was received and is currently under administrative intake review.`,
      type: NOTIFICATION_TYPES.REPORT_SUBMITTED,
      relatedItemId: item._id,
    });

    // Log Activity
    await ActivityLog.create({
      actorId: userId,
      action: 'ITEM_REPORTED',
      entityType: 'Item',
      entityId: item._id,
      description: `Reported ${item.type.toLowerCase()} item: ${item.title}`,
    });

    // Trigger asynchronous background AI match evaluation
    aiMatchService.scanAndGenerateMatches(item);

    return item;
  },

  async getPublicItems(query = {}) {
    const {
      search,
      type,
      category,
      campusZone,
      timeWindow,
      startDate,
      endDate,
      sort = 'newest',
      page = 1,
      limit = 9,
    } = query;

    const filter = {
      status: ITEM_STATUS.APPROVED,
    };

    if (type && type.toUpperCase() !== 'ALL') {
      filter.type = type.toUpperCase();
    }

    if (category && category !== 'all') {
      filter.categoryId = category;
    }

    if (campusZone && campusZone !== 'all') {
      filter['location.campusZone'] = campusZone;
    }

    // Time window calculation
    if (timeWindow && timeWindow !== 'all') {
      const now = new Date();
      let days = 30;
      if (timeWindow === '7d' || timeWindow === 'last7') days = 7;
      else if (timeWindow === '30d' || timeWindow === 'last30') days = 30;
      else if (timeWindow === '90d' || timeWindow === 'last90') days = 90;
      const sinceDate = new Date(now.setDate(now.getDate() - days));
      filter.itemDate = { $gte: sinceDate };
    } else if (startDate || endDate) {
      filter.itemDate = {};
      if (startDate) filter.itemDate.$gte = new Date(startDate);
      if (endDate) filter.itemDate.$lte = new Date(endDate);
    }

    // Keyword search
    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { brand: { $regex: search.trim(), $options: 'i' } },
        { 'location.name': { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Sorting
    let sortObj = { createdAt: -1 };
    if (sort === 'oldest') sortObj = { createdAt: 1 };
    else if (sort === 'date_desc') sortObj = { itemDate: -1 };
    else if (sort === 'date_asc') sortObj = { itemDate: 1 };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(parseInt(limit, 10) || 9, 50));
    const skip = (pageNum - 1) * limitNum;

    const [items, totalItems, allCount, lostCount, foundCount] = await Promise.all([
      Item.find(filter)
        .populate('categoryId', 'name slug')
        .populate('reportedBy', 'name')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum),
      Item.countDocuments(filter),
      Item.countDocuments({ status: ITEM_STATUS.APPROVED }),
      Item.countDocuments({ status: ITEM_STATUS.APPROVED, type: ITEM_TYPES.LOST }),
      Item.countDocuments({ status: ITEM_STATUS.APPROVED, type: ITEM_TYPES.FOUND }),
    ]);

    return {
      items,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limitNum) || 1,
        currentPage: pageNum,
        limit: limitNum,
      },
      counts: {
        all: allCount,
        lost: lostCount,
        found: foundCount,
      },
    };
  },

  async getItemById(itemId, currentUserId = null) {
    const item = await Item.findById(itemId)
      .populate('categoryId', 'name slug')
      .populate('reportedBy', 'name role profileImage');

    if (!item) {
      throw new Error('Item not found');
    }

    // Mask sensitive contact details if viewer is not the owner
    const isOwner = currentUserId && item.reportedBy?._id?.toString() === currentUserId.toString();
    const itemObj = item.toObject();

    if (!isOwner) {
      delete itemObj.serialNumber;
    }

    return itemObj;
  },

  async getUserItems(userId, query = {}) {
    const { type, status, search, sort = 'newest' } = query;
    const filter = { reportedBy: userId };

    if (type && type !== 'all') {
      filter.type = type.toUpperCase();
    }

    if (status && status !== 'all') {
      filter.status = status.toUpperCase();
    }

    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { 'location.name': { $regex: search.trim(), $options: 'i' } },
      ];
    }

    let sortObj = { createdAt: -1 };
    if (sort === 'oldest') sortObj = { createdAt: 1 };

    const items = await Item.find(filter)
      .populate('categoryId', 'name slug')
      .sort(sortObj);

    // Compute status counts for user telemetry
    const [total, lost, found, pending, approved, resolved] = await Promise.all([
      Item.countDocuments({ reportedBy: userId }),
      Item.countDocuments({ reportedBy: userId, type: ITEM_TYPES.LOST }),
      Item.countDocuments({ reportedBy: userId, type: ITEM_TYPES.FOUND }),
      Item.countDocuments({ reportedBy: userId, status: ITEM_STATUS.PENDING }),
      Item.countDocuments({ reportedBy: userId, status: ITEM_STATUS.APPROVED }),
      Item.countDocuments({ reportedBy: userId, status: ITEM_STATUS.RESOLVED }),
    ]);

    return {
      items,
      telemetry: {
        total,
        lost,
        found,
        pending,
        approved,
        resolved,
      },
    };
  },

  async updateUserItem(itemId, userId, updateData) {
    const item = await Item.findById(itemId);
    if (!item) {
      throw new Error('Item not found');
    }

    if (item.reportedBy.toString() !== userId.toString()) {
      throw new Error('You do not have permission to modify this report');
    }

    if (item.status !== ITEM_STATUS.PENDING) {
      throw new Error('Only pending reports can be edited. Contact an administrator for reviewed reports.');
    }

    const allowedFields = [
      'title',
      'brand',
      'description',
      'distinctiveFeatures',
      'location',
      'itemDate',
      'approximateTime',
      'condition',
      'storageLocation',
      'images',
      'categoryId',
    ];

    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        item[field] = updateData[field];
      }
    });

    await item.save();

    // Re-trigger matching
    aiMatchService.scanAndGenerateMatches(item);

    return item;
  },

  async deleteUserItem(itemId, userId) {
    const item = await Item.findById(itemId);
    if (!item) {
      throw new Error('Item not found');
    }

    if (item.reportedBy.toString() !== userId.toString()) {
      throw new Error('You do not have permission to delete this report');
    }

    if (item.status !== ITEM_STATUS.PENDING) {
      throw new Error('Only pending reports can be deleted/withdrawn directly');
    }

    await Item.findByIdAndDelete(itemId);

    await ActivityLog.create({
      actorId: userId,
      action: 'ITEM_WITHDRAWN',
      entityType: 'Item',
      entityId: itemId,
      description: `Withdrew report: ${item.title}`,
    });

    return { success: true, message: 'Report deleted successfully' };
  },
};
