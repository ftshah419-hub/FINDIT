import itemService from '../services/itemService.js';

export const listItems = async (req, res, next) => {
  try {
    const { page, limit, type, status, categoryId, search, depot, startDate, endDate } = req.query;
    const data = await itemService.getItems({
      page,
      limit,
      type,
      status,
      categoryId,
      search,
      depot,
      startDate,
      endDate,
    });
    res.status(200).json({
      success: true,
      message: 'Items retrieved successfully.',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getItemDetails = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const data = await itemService.getItemById(itemId);
    res.status(200).json({
      success: true,
      message: 'Item details retrieved successfully.',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const reviewItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { status, rejectionReason } = req.body;
    const data = await itemService.reviewItem(itemId, { status, rejectionReason }, req.user);
    res.status(200).json({
      success: true,
      message: `Item report ${status.toLowerCase()} successfully.`,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const updateItemStatus = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { status } = req.body;
    const data = await itemService.updateItemStatus(itemId, { status }, req.user);
    res.status(200).json({
      success: true,
      message: `Item status updated to ${status}.`,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  listItems,
  getItemDetails,
  reviewItem,
  updateItemStatus,
};
