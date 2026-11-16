import { Category } from '../models/Category.js';
import { DEFAULT_CATEGORIES } from '../constants/index.js';

export const categoryController = {
  async getCategories(req, res, next) {
    try {
      let categories = await Category.find({ isActive: true }).sort({ name: 1 });

      // If empty, auto-seed default categories
      if (categories.length === 0) {
        await Category.insertMany(DEFAULT_CATEGORIES);
        categories = await Category.find({ isActive: true }).sort({ name: 1 });
      }

      res.status(200).json({
        success: true,
        message: 'Categories retrieved successfully',
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  },
};
