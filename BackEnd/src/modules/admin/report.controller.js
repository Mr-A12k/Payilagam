const prisma = require('../../config/prisma');
const { success, error } = require("../../utils/responseHelper");
const catchAsync = require("../../utils/catchAsync");

const reportController = {
  createReport: catchAsync(async (request, response, next) => {
    const { resourceId } = request.params;
    const { reason } = request.body;
    const reporterId = request.user.userId;

    if (typeof reason !== 'string' || !reason.trim()) {
      return error(response, "Reason is required to submit a report", 400);
    }
    if (!/^\d+$/.test(resourceId) || !await prisma.resource.findUnique({ where: { resourceId: Number(resourceId) } })) return error(response, 'Resource not found', 404);

    const report = await prisma.report.create({
      data: {
        resourceId: parseInt(resourceId),
        reporterId,
        reason: reason.trim(),
        status: "pending",
      },
    });

    return success(response, report, "Resource reported successfully", 201);
  }),

  getAllReports: catchAsync(async (request, response, next) => {
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: "desc" },
    });
    const [resources, reporters] = await Promise.all([
      prisma.resource.findMany({ where: { resourceId: { in: reports.map(report => report.resourceId) } } }),
      prisma.user.findMany({ where: { userId: { in: reports.map(report => report.reporterId) } }, select: { userId: true, fullName: true, userName: true } }),
    ]);
    const resourceMap = new Map(resources.map(resource => [resource.resourceId, resource]));
    const reporterMap = new Map(reporters.map(user => [user.userId, user]));
    return success(response, reports.map(report => ({ ...report, resource: resourceMap.get(report.resourceId) || null, reporter: reporterMap.get(report.reporterId) || null })), "Reports fetched successfully");
  }),

  updateReportStatus: catchAsync(async (request, response, next) => {
    const { reportId } = request.params;
    const { status } = request.body;
    if (!['pending', 'reviewed', 'dismissed', 'actioned'].includes(status)) return error(response, 'Invalid report status', 400);

    const report = await prisma.report.update({
      where: { reportId: parseInt(reportId) },
      data: { status },
    });

    return success(response, report, "Report status updated");
  }),
};

module.exports = reportController;
