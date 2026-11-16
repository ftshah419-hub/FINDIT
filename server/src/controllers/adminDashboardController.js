const dashboardService = require('../services/dashboardService');

const getDashboard = async (req, res, next) => {
  try {
    const data = await dashboardService.getDashboardData();
    res.status(200).json({
      success: true,
      message: 'Admin dashboard telemetry loaded successfully.',
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
};
