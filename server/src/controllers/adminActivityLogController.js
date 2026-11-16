const activityLogService = require('../services/activityLogService');

const listActivityLogs = async (req, res, next) => {
  try {
    const { page, limit, action, entityType, actorId, startDate, endDate } = req.query;
    const data = await activityLogService.getActivityLogs({
      page,
      limit,
      action,
      entityType,
      actorId,
      startDate,
      endDate,
    });
    res.status(200).json({
      success: true,
      message: 'Activity logs retrieved successfully.',
      data,
    });
  } catch (error) {
    next(error);
  }
};

const exportActivityLogs = async (req, res, next) => {
  try {
    const { action, entityType, startDate, endDate } = req.query;
    const { logs } = await activityLogService.getActivityLogs({
      page: 1,
      limit: 1000,
      action,
      entityType,
      startDate,
      endDate,
    });

    // Generate CSV format
    const headers = ['Timestamp', 'Action', 'Actor Name', 'Actor Email', 'Entity Type', 'Entity ID', 'Description'];
    const rows = logs.map((log) => [
      new Date(log.createdAt).toISOString(),
      `"${log.action || ''}"`,
      `"${log.actorId?.name || 'System'}"`,
      `"${log.actorId?.email || 'N/A'}"`,
      `"${log.entityType || ''}"`,
      `"${log.entityId || ''}"`,
      `"${(log.description || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=findit-activity-logs-${Date.now()}.csv`);
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listActivityLogs,
  exportActivityLogs,
};
