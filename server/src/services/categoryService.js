import { Category, Item } from '../models/index.js';
import { logActivity } from './activityLogService.js';

/**
 * Fetch all categories with real-time item count
 */
export const getCategories = async ({ search = '', includeInactive = true } = {}) => {
  const query = {};
  if (!includeInactive) {
    query.isActive = true;
  }
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  const categories = await Category.find(query)
    .populate('createdBy', 'name email')
    .sort({ name: 1 })
    .lean();

  const categoriesWithCount = await Promise.all(
    categories.map(async (cat) => {
      const itemCount = await Item.countDocuments({ categoryId: cat._id });
      return {
        ...cat,
        itemCount,
      };
    })
  );

  return categoriesWithCount;
};

/**
 * Create a new category
 */
export const createCategory = async ({ name, description = '' }, adminUser) => {
  const trimmedName = name.trim();
  const existing = await Category.findOne({ name: { $regex: `^${trimmedName}$`, $options: 'i' } });
  if (existing) {
    const error = new Error(`Category "${trimmedName}" already exists.`);
    error.statusCode = 409;
    throw error;
  }

  const category = await Category.create({
    name: trimmedName,
    description: description.trim(),
    isActive: true,
    createdBy: adminUser?._id,
  });

  if (adminUser?._id) {
    await logActivity({
      actorId: adminUser._id,
      action: 'CATEGORY_CREATED',
      entityType: 'Category',
      entityId: category._id,
      description: `Administrator ${adminUser.name || 'Admin'} created category "${category.name}".`,
      metadata: { name: category.name },
    });
  }

  return category;
};

/**
 * Update an existing category (edit or activate/deactivate)
 */
export const updateCategory = async (categoryId, { name, description, isActive }, adminUser) => {
  const category = await Category.findById(categoryId);
  if (!category) {
    const error = new Error('Category not found.');
    error.statusCode = 404;
    throw error;
  }

  if (name && name.trim() !== category.name) {
    const trimmedName = name.trim();
    const existing = await Category.findOne({
      name: { $regex: `^${trimmedName}$`, $options: 'i' },
      _id: { $ne: category._id },
    });
    if (existing) {
      const error = new Error(`Category name "${trimmedName}" is already in use.`);
      error.statusCode = 409;
      throw error;
    }
    category.name = trimmedName;
  }

  if (description !== undefined) {
    category.description = description.trim();
  }

  if (isActive !== undefined) {
    category.isActive = Boolean(isActive);
  }

  await category.save();

  if (adminUser?._id) {
    await logActivity({
      actorId: adminUser._id,
      action: 'CATEGORY_UPDATED',
      entityType: 'Category',
      entityId: category._id,
      description: `Administrator ${adminUser.name || 'Admin'} updated category "${category.name}".`,
      metadata: { name: category.name, isActive: category.isActive },
    });
  }

  return category;
};

export const categoryService = {
  getCategories,
  createCategory,
  updateCategory,
};

export default categoryService;
