const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { success, error } = require("../../utils/responseHelper");
const catchAsync = require("../../utils/catchAsync");

const reportController = {
  createReport: catchAsync(async (request, response, next) => {
    const { resourceId } = request.params;
    const { reason } = request.body;
    const reporterId = request.user.userId;

    if (!reason) {
      return error(response, "Reason is required to submit a report", 400);
    }

    const report = await prisma.report.create({
      data: {
        resourceId: parseInt(resourceId),
        reporterId,
        reason,
        status: "pending",
      },
    });

    return success(response, report, "Resource reported successfully", 201);
  }),

  getAllReports: catchAsync(async (request, response, next) => {
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        resource: true,
        reporter: {
          select: { fullName: true, userName: true },
        },
      },
    });
    return success(response, reports, "Reports fetched successfully");
  }),

  updateReportStatus: catchAsync(async (request, response, next) => {
    const { reportId } = request.params;
    const { status } = request.body;

    const report = await prisma.report.update({
      where: { reportId: parseInt(reportId) },
      data: { status },
    });

    return success(response, report, "Report status updated");
  }),
};

module.exports = reportController;
