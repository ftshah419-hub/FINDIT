import { itemService } from '../services/itemService.js';

export const itemController = {
  async createItem(req, res, next) {
    try {
      const item = await itemService.createItem(req.body, req.user._id);
      res.status(201).json({
        success: true,
        message: 'Item report created successfully',
        data: item,
      });
    } catch (error) {
      next(error);
    }
  },

  async getPublicItems(req, res, next) {
    try {
      const result = await itemService.getPublicItems(req.query);
      res.status(200).json({
        success: true,
        message: 'Items retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getItemById(req, res, next) {
    try {
      const item = await itemService.getItemById(req.params.itemId, req.user?._id);
      res.status(200).json({
        success: true,
        message: 'Item details retrieved',
        data: item,
      });
    } catch (error) {
      next(error);
    }
  },

  async getUserItems(req, res, next) {
    try {
      const result = await itemService.getUserItems(req.user._id, req.query);
      res.status(200).json({
        success: true,
        message: 'User reports retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateUserItem(req, res, next) {
    try {
      const updatedItem = await itemService.updateUserItem(
        req.params.itemId,
        req.user._id,
        req.body
      );
      res.status(200).json({
        success: true,
        message: 'Item report updated successfully',
        data: updatedItem,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteUserItem(req, res, next) {
    try {
      const result = await itemService.deleteUserItem(req.params.itemId, req.user._id);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  },
};
