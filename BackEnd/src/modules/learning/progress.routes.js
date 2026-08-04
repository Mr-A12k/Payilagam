/**
 * @swagger
 * tags:
 *   name: Progress
 *   description: Student progress tracking endpoints
 */
const express = require("express");
const router = express.Router();

const {
  markLessonComplete,
  markLessonIncomplete,
  updateWatchTime,
  getCourseProgress,
  getStudentDashboard,
} = require("./progress.controller");

const { authenticate, authorize } = require("../../middlewares/authMiddleware");

// All progress routes are student-only
/**
 * @swagger
 * /progress/lesson/{lessonId}/complete:
 *   post:
 *     summary: Mark a lesson as complete
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lesson marked as complete
 */
router.post(
  "/lesson/:lessonId/complete",
  authenticate,
  authorize("student"),
  markLessonComplete,
);
/**
 * @swagger
 * /progress/lesson/{lessonId}/incomplete:
 *   post:
 *     summary: Mark a lesson as incomplete
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lesson marked as incomplete
 */
router.post(
  "/lesson/:lessonId/incomplete",
  authenticate,
  authorize("student"),
  markLessonIncomplete,
);
/**
 * @swagger
 * /progress/lesson/{lessonId}/watch-time:
 *   put:
 *     summary: Update watch time for a lesson
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Watch time updated
 */
router.put(
  "/lesson/:lessonId/watch-time",
  authenticate,
  authorize("student"),
  updateWatchTime,
);
/**
 * @swagger
 * /progress/course/{courseId}:
 *   get:
 *     summary: Get progress for a specific course
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course progress details
 */
router.get(
  "/course/:courseId",
  authenticate,
  authorize("student"),
  getCourseProgress,
);
/**
 * @swagger
 * /progress/dashboard:
 *   get:
 *     summary: Get student progress dashboard
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data
 */
router.get(
  "/dashboard",
  authenticate,
  authorize("student"),
  getStudentDashboard,
);

module.exports = router;
