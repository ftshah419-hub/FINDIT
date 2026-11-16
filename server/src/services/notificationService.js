import { Notification } from '../models/Notification.js';

export const notificationService = {
  async getUserNotifications(userId, limit = 20) {
    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ recipientId: userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('relatedItemId', 'title type images')
        .populate('relatedClaimId', 'status'),
      Notification.countDocuments({ recipientId: userId, isRead: false }),
    ]);

    return {
      notifications,
      unreadCount,
    };
  },

  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipientId: userId },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      throw new Error('Notification not found');
    }
    return notification;
  },

  async markAllAsRead(userId) {
    await Notification.updateMany(
      { recipientId: userId, isRead: false },
      { isRead: true }
    );
    return { success: true, message: 'All notifications marked as read' };
  },

  async createNotification(data) {
    return await Notification.create(data);
  },
};
