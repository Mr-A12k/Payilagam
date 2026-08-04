const express = require('express');
const router = express.Router();
const reportController = require('./report.controller');
const authMiddleware = require('../../middlewares/authMiddleware');

// Base route is usually /api/v1/resources/:resourceId/report or /api/v1/reports
router.post('/resources/:resourceId/report', authMiddleware.authenticate, reportController.createReport);
router.get('/reports', authMiddleware.authenticate, authMiddleware.authorize('admin'), reportController.getAllReports);
router.patch('/reports/:reportId', authMiddleware.authenticate, authMiddleware.authorize('admin'), reportController.updateReportStatus);

module.exports = router;
