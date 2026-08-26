/**
 * @swagger
 * tags:
 *   name: Assignments
 *   description: Assignment management endpoints
 */
const express = require("express");
const router = express.Router();

const {
  createAssignment,
  getAssignmentsByCourse,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  getUpcomingAssignments,
} = require("./assignment.controller");

const { authenticate, authorize } = require("../../middlewares/authMiddleware");

// All routes require authentication
router.use(authenticate);

// Student - get upcoming assignments for enrolled courses
/**
 * @swagger
 * /assignments/upcoming:
 *   get:
 *     summary: Get upcoming assignments for enrolled courses
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of upcoming assignments
 */
router.get("/upcoming", authorize("student"), getUpcomingAssignments);

// Get all assignments for a course (any authenticated user)
/**
 * @swagger
 * /assignments/course/{courseId}:
 *   get:
 *     summary: Get all assignments for a course
 *     tags: [Assignments]
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
 *         description: A list of assignments for the course
 */
router.get("/course/:courseId", getAssignmentsByCourse);

// Get single assignment
/**
 * @swagger
 * /assignments/{id}:
 *   get:
 *     summary: Get single assignment
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Assignment details
 */
router.get("/:id", getAssignmentById);

// Mentor/Admin - create assignment
/**
 * @swagger
 * /assignments:
 *   post:
 *     summary: Create an assignment
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Assignment created successfully
 */
router.post("/", authorize("mentor", "admin"), createAssignment);

// Mentor/Admin - update assignment
/**
 * @swagger
 * /assignments/{id}:
 *   put:
 *     summary: Update an assignment
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Assignment updated successfully
 */
router.put("/:id", authorize("mentor", "admin"), updateAssignment);

// Mentor/Admin - delete assignment
/**
 * @swagger
 * /assignments/{id}:
 *   delete:
 *     summary: Delete an assignment
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Assignment deleted successfully
 */
router.delete("/:id", authorize("mentor", "admin"), deleteAssignment);

module.exports = router;
