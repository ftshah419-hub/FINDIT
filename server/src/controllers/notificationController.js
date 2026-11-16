import { notificationService } from '../services/notificationService.js';

export const notificationController = {
  async getUserNotifications(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 20;
      const result = await notificationService.getUserNotifications(req.user._id, limit);
      res.status(200).json({
        success: true,
        message: 'Notifications retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async markAsRead(req, res, next) {
    try {
      const notification = await notificationService.markAsRead(
        req.params.notificationId,
        req.user._id
      );
      res.status(200).json({
        success: true,
        message: 'Notification marked as read',
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  },

  async markAllAsRead(req, res, next) {
    try {
      const result = await notificationService.markAllAsRead(req.user._id);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  },
};
