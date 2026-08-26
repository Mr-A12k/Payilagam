/**
 * @swagger
 * tags:
 *   name: Lessons
 *   description: Lesson management
 */
const express = require("express");
const router = express.Router();

const {
  createLesson,
  getLessonsByModule,
  getLessonById,
  updateLesson,
  deleteLesson,
} = require("./lesson.controller");

const { authenticate, authorize } = require("../../middlewares/authMiddleware");

// All routes require authentication
router.use(authenticate);

// Get all lessons for a module
/**
 * @swagger
 * /module/{moduleId}:
 *   get:
 *     summary: Get all lessons for a module
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: moduleId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of lessons
 */
router.get("/module/:moduleId", getLessonsByModule);

// Get a single lesson (includes student progress if role is student)
/**
 * @swagger
 * /{id}:
 *   get:
 *     summary: Get a single lesson
 *     tags: [Lessons]
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
 *         description: Lesson details
 */
router.get("/:id", getLessonById);

// Create a lesson for a module (mentor/admin only)
/**
 * @swagger
 * /module/{moduleId}:
 *   post:
 *     summary: Create a lesson for a module
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: moduleId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Lesson created
 */
router.post("/module/:moduleId", authorize("mentor", "admin"), createLesson);

// Update a lesson (mentor/admin only)
/**
 * @swagger
 * /{id}:
 *   put:
 *     summary: Update a lesson
 *     tags: [Lessons]
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
 *         description: Lesson updated
 */
router.put("/:id", authorize("mentor", "admin"), updateLesson);

// Delete a lesson (mentor/admin only)
/**
 * @swagger
 * /{id}:
 *   delete:
 *     summary: Delete a lesson
 *     tags: [Lessons]
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
 *         description: Lesson deleted
 */
router.delete("/:id", authorize("mentor", "admin"), deleteLesson);

module.exports = router;
