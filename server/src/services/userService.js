const { User, Item, Claim } = require('../models');
const { logActivity } = require('./activityLogService');

/**
 * Fetch paginated users with search and filtering
 */
const getUsers = async ({ page = 1, limit = 10, search = '', role, status }) => {
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

  // Attach report and claim counts for each user
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

/**
 * Get detailed user record
 */
const getUserById = async (userId) => {
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

/**
 * Update user account status (Activate / Suspend)
 */
const updateUserStatus = async (userId, { isActive, reason }, adminUser) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  // Prevent admin from deactivating themselves
  if (user._id.toString() === adminUser._id.toString()) {
    const error = new Error('Administrators cannot deactivate their own account.');
    error.statusCode = 400;
    throw error;
  }

  const prevStatus = user.isActive;
  user.isActive = isActive;
  await user.save();

  await logActivity({
    actorId: adminUser._id,
    action: isActive ? 'USER_ACTIVATED' : 'USER_SUSPENDED',
    entityType: 'User',
    entityId: user._id,
    description: `Administrator ${adminUser.name} ${isActive ? 'activated' : 'suspended'} account for ${user.email}.${reason ? ` Reason: ${reason}` : ''}`,
    metadata: { previousStatus: prevStatus, newStatus: isActive, reason },
  });

  return user.toJSON();
};

module.exports = {
  getUsers,
  getUserById,
  updateUserStatus,
};
