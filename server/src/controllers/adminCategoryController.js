const categoryService = require('../services/categoryService');

const listCategories = async (req, res, next) => {
  try {
    const { search, includeInactive } = req.query;
    const data = await categoryService.getCategories({
      search,
      includeInactive: includeInactive !== 'false',
    });
    res.status(200).json({
      success: true,
      message: 'Categories retrieved successfully.',
      data,
    });
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const data = await categoryService.createCategory({ name, description }, req.user);
    res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      data,
    });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const { name, description, isActive } = req.body;
    const data = await categoryService.updateCategory(categoryId, { name, description, isActive }, req.user);
    res.status(200).json({
      success: true,
      message: 'Category updated successfully.',
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listCategories,
  createCategory,
  updateCategory,
};
