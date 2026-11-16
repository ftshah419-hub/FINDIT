const { Notification } = require('../models');

/**
 * Dispatch an in-app notification to a user
 */
const createNotification = async ({ recipientId, title, message, type = 'SYSTEM', relatedItemId = null }) => {
  try {
    const notification = await Notification.create({
      recipientId,
      title,
      message,
      type,
      relatedItemId,
    });
    return notification;
  } catch (error) {
    console.error('[Notification Error] Failed to create notification:', error.message);
    return null;
  }
};

module.exports = {
  createNotification,
};
