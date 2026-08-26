/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Report management
 */
const express = require("express");
const router = express.Router();
const reportController = require("./report.controller");
const authMiddleware = require("../../middlewares/authMiddleware");

// Base route is usually /api/v1/resources/:resourceId/report or /api/v1/reports
/**
 * @swagger
 * /resources/{resourceId}/report:
 *   post:
 *     summary: Create a report for a resource
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Report created
 */
router.post(
  "/resources/:resourceId/report",
  authMiddleware.authenticate,
  reportController.createReport,
);
/**
 * @swagger
 * /reports:
 *   get:
 *     summary: Get all reports
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of reports
 */
router.get(
  "/reports",
  authMiddleware.authenticate,
  authMiddleware.authorize("admin"),
  reportController.getAllReports,
);
/**
 * @swagger
 * /reports/{reportId}:
 *   patch:
 *     summary: Update report status
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Report updated
 */
router.patch(
  "/reports/:reportId",
  authMiddleware.authenticate,
  authMiddleware.authorize("admin"),
  reportController.updateReportStatus,
);

module.exports = router;
