/**
 * @swagger
 * tags:
 *   name: Modules
 *   description: Module management
 */
const express = require("express");
const router = express.Router();

const {
  createModule,
  getModulesByCourse,
  getModuleById,
  updateModule,
  deleteModule,
  reorderModules,
} = require("./module.controller");

const { authenticate, authorize } = require("../../middlewares/authMiddleware");

// All routes require authentication
router.use(authenticate);

// Get all modules for a course
/**
 * @swagger
 * /course/{courseId}:
 *   get:
 *     summary: Get all modules for a course
 *     tags: [Modules]
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
 *         description: List of modules
 */
router.get("/course/:courseId", getModulesByCourse);

// Get a single module with lessons
/**
 * @swagger
 * /{id}:
 *   get:
 *     summary: Get a single module with lessons
 *     tags: [Modules]
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
 *         description: Module details
 */
router.get("/:id", getModuleById);

// Create a module for a course (mentor/admin only)
/**
 * @swagger
 * /course/{courseId}:
 *   post:
 *     summary: Create a module for a course
 *     tags: [Modules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Module created
 */
router.post("/course/:courseId", authorize("mentor", "admin"), createModule);

// Reorder modules for a course (mentor/admin only)
// NOTE: This must come BEFORE PUT /:id to avoid route conflicts
/**
 * @swagger
 * /course/{courseId}/reorder:
 *   put:
 *     summary: Reorder modules for a course
 *     tags: [Modules]
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
 *         description: Modules reordered
 */
router.put(
  "/course/:courseId/reorder",
  authorize("mentor", "admin"),
  reorderModules,
);

// Update a module (mentor/admin only)
/**
 * @swagger
 * /{id}:
 *   put:
 *     summary: Update a module
 *     tags: [Modules]
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
 *         description: Module updated
 */
router.put("/:id", authorize("mentor", "admin"), updateModule);

// Delete a module (mentor/admin only)
/**
 * @swagger
 * /{id}:
 *   delete:
 *     summary: Delete a module
 *     tags: [Modules]
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
 *         description: Module deleted
 */
router.delete("/:id", authorize("mentor", "admin"), deleteModule);

module.exports = router;
