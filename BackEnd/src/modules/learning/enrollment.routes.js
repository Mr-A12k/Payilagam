/**
 * @swagger
 * tags:
 *   name: Enrollments
 *   description: Enrollment management endpoints
 */
const express = require("express");
const router = express.Router();
router.param('courseId', (request, response, next) => require('./validation').params(request, response, next));

const {
  enroll,
  unenroll,
  getMyEnrollments,
  getCourseEnrollments,
  checkEnrollment,
  getEnrollmentStats,
} = require("./enrollment.controller");

const { authenticate, authorize } = require("../../middlewares/authMiddleware");

// Student routes (accessible to anyone)
/**
 * @swagger
 * /enrollments/{courseId}/enroll:
 *   post:
 *     summary: Enroll in a course
 *     tags: [Enrollments]
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
 *         description: Successfully enrolled
 */
router.post("/:courseId/enroll", authenticate, enroll);
/**
 * @swagger
 * /enrollments/{courseId}/unenroll:
 *   delete:
 *     summary: Unenroll from a course
 *     tags: [Enrollments]
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
 *         description: Successfully unenrolled
 */
router.delete("/:courseId/unenroll", authenticate, unenroll);
/**
 * @swagger
 * /enrollments/my-courses:
 *   get:
 *     summary: Get my enrollments
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of enrolled courses
 */
router.get("/my-courses", authenticate, getMyEnrollments);

// Mentor/Admin routes
/**
 * @swagger
 * /enrollments/course/{courseId}/students:
 *   get:
 *     summary: Get all students enrolled in a course
 *     tags: [Enrollments]
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
 *         description: A list of students
 */
router.get(
  "/course/:courseId/students",
  authenticate,
  authorize("mentor", "admin"),
  getCourseEnrollments,
);
/**
 * @swagger
 * /enrollments/stats/{courseId}:
 *   get:
 *     summary: Get enrollment statistics for a course
 *     tags: [Enrollments]
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
 *         description: Enrollment statistics
 */
router.get(
  "/stats/:courseId",
  authenticate,
  authorize("mentor", "admin"),
  getEnrollmentStats,
);

// Authenticated route (any role)
/**
 * @swagger
 * /enrollments/check/{courseId}:
 *   get:
 *     summary: Check if the user is enrolled in a course
 *     tags: [Enrollments]
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
 *         description: Enrollment status
 */
router.get("/check/:courseId", authenticate, checkEnrollment);

module.exports = router;
