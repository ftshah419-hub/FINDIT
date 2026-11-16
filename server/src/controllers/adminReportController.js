const reportService = require('../services/reportService');

const listReports = async (req, res, next) => {
  try {
    const { page, limit, status, search } = req.query;
    const data = await reportService.getReports({ page, limit, status, search });
    res.status(200).json({
      success: true,
      message: 'Complaints retrieved successfully.',
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getReportDetails = async (req, res, next) => {
  try {
    const { reportId } = req.params;
    const data = await reportService.getReportById(reportId);
    res.status(200).json({
      success: true,
      message: 'Complaint details retrieved successfully.',
      data,
    });
  } catch (error) {
    next(error);
  }
};

const reviewReport = async (req, res, next) => {
  try {
    const { reportId } = req.params;
    const { status, adminNote } = req.body;
    const data = await reportService.reviewReport(reportId, { status, adminNote }, req.user);
    res.status(200).json({
      success: true,
      message: `Complaint review decision saved: ${status}.`,
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listReports,
  getReportDetails,
  reviewReport,
};
