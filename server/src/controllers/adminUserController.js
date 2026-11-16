const userService = require('../services/userService');

const listUsers = async (req, res, next) => {
  try {
    const { page, limit, search, role, status } = req.query;
    const data = await userService.getUsers({ page, limit, search, role, status });
    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully.',
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getUserDetails = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const data = await userService.getUserById(userId);
    res.status(200).json({
      success: true,
      message: 'User details retrieved successfully.',
      data,
    });
  } catch (error) {
    next(error);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { isActive, reason } = req.body;
    const data = await userService.updateUserStatus(userId, { isActive, reason }, req.user);
    res.status(200).json({
      success: true,
      message: `User account has been ${isActive ? 'activated' : 'suspended'} successfully.`,
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listUsers,
  getUserDetails,
  updateUserStatus,
};
