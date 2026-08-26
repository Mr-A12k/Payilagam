/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Course management
 */
const express = require("express");
const router = express.Router();

const {
  create,
  getAll,
  getById,
  update,
  remove,
  requestDeletion,
  getMyCourses,
  getPublished,
  getMentorStats,
} = require("./course.controller");

const { authenticate, authorize } = require("../../middlewares/authMiddleware");
const upload = require("../../middlewares/uploadMiddleware");

// Public routes (must be before /:id to avoid param conflicts)
/**
 * @swagger
 * /published:
 *   get:
 *     summary: Get all published courses
 *     tags: [Courses]
 *     responses:
 *       200:
 *         description: List of published courses
 */
router.get("/published", getPublished);

// Authenticated routes
/**
 * @swagger
 * /mentor/stats:
 *   get:
 *     summary: Get mentor statistics
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Mentor statistics
 */
router.get(
  "/mentor/stats",
  authenticate,
  authorize("mentor", "admin"),
  getMentorStats,
);

/**
 * @swagger
 * /mentor/my-courses:
 *   get:
 *     summary: Get courses created by mentor
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of mentor's courses
 */
router.get(
  "/mentor/my-courses",
  authenticate,
  authorize("mentor", "admin"),
  getMyCourses,
);

/**
 * @swagger
 * /:
 *   get:
 *     summary: Get all courses (requires authentication)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all courses
 */
router.get("/", authenticate, getAll);

/**
 * @swagger
 * /{uniqueId}:
 *   get:
 *     summary: Get a course by its unique ID
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: uniqueId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course details
 */
router.get("/:uniqueId", getById);

// Mentor and admin routes
/**
 * @swagger
 * /:
 *   post:
 *     summary: Create a new course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Course created
 */
router.post(
  "/",
  authenticate,
  authorize("mentor", "admin"),
  upload.single("thumbnail"),
  create,
);

/**
 * @swagger
 * /{uniqueId}:
 *   put:
 *     summary: Update a course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uniqueId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course updated
 */
router.put(
  "/:uniqueId",
  authenticate,
  authorize("mentor", "admin"),
  upload.single("thumbnail"),
  update,
);

/**
 * @swagger
 * /{uniqueId}/request-deletion:
 *   post:
 *     summary: Request course deletion
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uniqueId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deletion requested
 */
router.post(
  "/:uniqueId/request-deletion",
  authenticate,
  authorize("mentor"),
  requestDeletion,
);

// Admin only
/**
 * @swagger
 * /{uniqueId}:
 *   delete:
 *     summary: Delete a course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uniqueId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course deleted
 */
router.delete("/:uniqueId", authenticate, authorize("admin"), remove);

module.exports = router;
