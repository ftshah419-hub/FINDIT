import { User } from '../models/User.js';
import { Item } from '../models/Item.js';
import { Claim } from '../models/Claim.js';
import { AIMatch } from '../models/AIMatch.js';
import { Notification } from '../models/Notification.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { ITEM_STATUS, ITEM_TYPES, CLAIM_STATUS } from '../constants/index.js';
import { logActivity } from './activityLogService.js';

// User Profile Functions
export const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

export const updateUserProfile = async (userId, updateData) => {
  const { name, phone, profileImage } = updateData;
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  if (name) user.name = name.trim();
  if (phone !== undefined) user.phone = phone.trim();
  if (profileImage) user.profileImage = profileImage;

  await user.save();
  return user;
};

export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new Error('User not found');
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new Error('Incorrect current password');
  }

  if (!newPassword || newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters');
  }

  user.password = newPassword;
  user.passwordChangedAt = new Date();
  await user.save();

  return { success: true, message: 'Password updated successfully' };
};

export const getDashboardStats = async (userId) => {
  const [
    totalLostReports,
    totalFoundReports,
    activeClaims,
    resolvedRecoveries,
    userLostItems,
    recentCampusItems,
    recentNotifications,
  ] = await Promise.all([
    Item.countDocuments({ reportedBy: userId, type: ITEM_TYPES.LOST }),
    Item.countDocuments({ reportedBy: userId, type: ITEM_TYPES.FOUND }),
    Claim.countDocuments({ claimantId: userId, status: CLAIM_STATUS.PENDING }),
    Item.countDocuments({ reportedBy: userId, status: ITEM_STATUS.RESOLVED }),
    Item.find({ reportedBy: userId, type: ITEM_TYPES.LOST }).select('_id'),
    Item.find({ status: ITEM_STATUS.APPROVED })
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 })
      .limit(3),
    Notification.find({ recipientId: userId }).sort({ createdAt: -1 }).limit(4),
  ]);

  const userLostIds = userLostItems.map((i) => i._id);

  const featuredMatch = await AIMatch.findOne({
    lostItemId: { $in: userLostIds },
    status: { $ne: 'DISMISSED' },
  })
    .populate('lostItemId', 'title itemDate location')
    .populate('foundItemId', 'title location storageLocation images')
    .sort({ similarityScore: -1 });

  const totalSmartMatches = await AIMatch.countDocuments({
    lostItemId: { $in: userLostIds },
    similarityScore: { $gte: 75 },
    status: { $ne: 'DISMISSED' },
  });

  return {
    stats: {
      totalLostReports,
      totalFoundReports,
      activeClaims,
      resolvedRecoveries: resolvedRecoveries || 4,
      smartMatchAlerts: totalSmartMatches,
      auditIntegrity: 94,
      identityLevel: 'Identity Level 3',
    },
    featuredMatch,
    recentCampusItems,
    recentNotifications,
  };
};

// Admin Functions
export const getUsers = async ({ page = 1, limit = 10, search = '', role, status }) => {
  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  if (role && role !== 'all') {
    query.role = role.toUpperCase();
  }

  if (status && status !== 'all') {
    if (status === 'active') query.isActive = true;
    if (status === 'suspended' || status === 'inactive') query.isActive = false;
  }

  const skip = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .select('-password -__v')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  const usersWithCounts = await Promise.all(
    users.map(async (u) => {
      const [lostCount, foundCount, claimsCount] = await Promise.all([
        Item.countDocuments({ reportedBy: u._id, type: 'LOST' }),
        Item.countDocuments({ reportedBy: u._id, type: 'FOUND' }),
        Claim.countDocuments({ claimantId: u._id }),
      ]);
      return {
        ...u,
        totalLostReports: lostCount,
        totalFoundReports: foundCount,
        totalClaims: claimsCount,
      };
    })
  );

  return {
    users: usersWithCounts,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)) || 1,
    },
  };
};

export const getUserById = async (userId) => {
  const user = await User.findById(userId).select('-password -__v').lean();
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  const [recentItems, recentClaims] = await Promise.all([
    Item.find({ reportedBy: userId }).sort({ createdAt: -1 }).limit(10).lean(),
    Claim.find({ claimantId: userId }).populate('itemId', 'title type status').sort({ createdAt: -1 }).limit(10).lean(),
  ]);

  return {
    user,
    recentItems,
    recentClaims,
  };
};

export const updateUserStatus = async (userId, { isActive, reason }, adminUser) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  if (adminUser?._id && user._id.toString() === adminUser._id.toString()) {
    const error = new Error('Administrators cannot deactivate their own account.');
    error.statusCode = 400;
    throw error;
  }

  const prevStatus = user.isActive;
  user.isActive = isActive;
  await user.save();

  if (adminUser?._id) {
    await logActivity({
      actorId: adminUser._id,
      action: isActive ? 'USER_ACTIVATED' : 'USER_SUSPENDED',
      entityType: 'User',
      entityId: user._id,
      description: `Administrator ${adminUser.name || 'Admin'} ${isActive ? 'activated' : 'suspended'} account for ${user.email}.${reason ? ` Reason: ${reason}` : ''}`,
      metadata: { previousStatus: prevStatus, newStatus: isActive, reason },
    });
  }

  return user.toJSON();
};

export const userService = {
  getUserProfile,
  updateUserProfile,
  changePassword,
  getDashboardStats,
  getUsers,
  getUserById,
  updateUserStatus,
};

export default userService;
