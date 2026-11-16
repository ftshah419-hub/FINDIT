const { Report } = require('../models');
const { REPORT_STATUS } = require('../constants');
const { logActivity } = require('./activityLogService');

/**
 * Fetch complaints / abuse reports with filters
 */
const getReports = async ({ page = 1, limit = 10, status, search = '' }) => {
  const query = {};

  if (status && status !== 'all') {
    query.status = status.toUpperCase();
  }

  const skip = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
  const total = await Report.countDocuments(query);

  let reports = await Report.find(query)
    .populate('reporterId', 'name email profileImage phone')
    .populate({
      path: 'itemId',
      populate: { path: 'reportedBy', select: 'name email' },
    })
    .populate('reviewedBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  if (search) {
    const s = search.toLowerCase();
    reports = reports.filter(
      (r) =>
        r.reason?.toLowerCase().includes(s) ||
        r.description?.toLowerCase().includes(s) ||
        r.itemId?.title?.toLowerCase().includes(s) ||
        r.reporterId?.name?.toLowerCase().includes(s)
    );
  }

  return {
    reports,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)) || 1,
    },
  };
};

/**
 * Get detailed complaint by ID
 */
const getReportById = async (reportId) => {
  const report = await Report.findById(reportId)
    .populate('reporterId', 'name email profileImage phone')
    .populate({
      path: 'itemId',
      populate: [
        { path: 'categoryId', select: 'name' },
        { path: 'reportedBy', select: 'name email profileImage phone' },
      ],
    })
    .populate('reviewedBy', 'name email')
    .lean();

  if (!report) {
    const error = new Error('Complaint record not found.');
    error.statusCode = 404;
    throw error;
  }

  return report;
};

/**
 * Review complaint: update status, record admin note
 */
const reviewReport = async (reportId, { status, adminNote = '' }, adminUser) => {
  if (!Object.values(REPORT_STATUS).includes(status)) {
    const error = new Error('Invalid report status.');
    error.statusCode = 400;
    throw error;
  }

  const report = await Report.findById(reportId).populate('itemId');
  if (!report) {
    const error = new Error('Complaint not found.');
    error.statusCode = 404;
    throw error;
  }

  const prevStatus = report.status;
  report.status = status;
  report.adminNote = adminNote;
  report.reviewedBy = adminUser._id;
  if (status === REPORT_STATUS.RESOLVED || status === REPORT_STATUS.DISMISSED) {
    report.resolvedAt = new Date();
  }

  await report.save();

  await logActivity({
    actorId: adminUser._id,
    action: 'REPORT_REVIEWED',
    entityType: 'Report',
    entityId: report._id,
    description: `Administrator ${adminUser.name} marked complaint #${report._id.toString().slice(-6)} on "${report.itemId?.title || 'item'}" as ${status}.`,
    metadata: { previousStatus: prevStatus, newStatus: status, adminNote },
  });

  return report;
};

module.exports = {
  getReports,
  getReportById,
  reviewReport,
};
