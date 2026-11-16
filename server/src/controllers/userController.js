import { userService } from '../services/userService.js';

export const userController = {
  async getProfile(req, res, next) {
    try {
      const user = await userService.getUserProfile(req.user._id);
      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req, res, next) {
    try {
      const user = await userService.updateUserProfile(req.user._id, req.body);
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await userService.changePassword(
        req.user._id,
        currentPassword,
        newPassword
      );
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  },

  async getDashboardStats(req, res, next) {
    try {
      const stats = await userService.getDashboardStats(req.user._id);
      res.status(200).json({
        success: true,
        message: 'Dashboard metrics retrieved',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },
};
