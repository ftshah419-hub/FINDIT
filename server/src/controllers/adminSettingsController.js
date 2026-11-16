const settingsService = require('../services/settingsService');

const listSettings = async (req, res, next) => {
  try {
    const data = await settingsService.getSettings();
    res.status(200).json({
      success: true,
      message: 'Platform settings retrieved successfully.',
      data,
    });
  } catch (error) {
    next(error);
  }
};

const updateSetting = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { value, description } = req.body;
    const data = await settingsService.updateSetting(key, { value, description }, req.user);
    res.status(200).json({
      success: true,
      message: `Setting "${key}" updated successfully.`,
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listSettings,
  updateSetting,
};
