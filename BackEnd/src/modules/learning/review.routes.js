/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Course reviews endpoints
 */
const express = require("express");
const router = express.Router();

const {
  createReview,
  getCourseReviews,
  updateReview,
  deleteReview,
  getCourseRating,
} = require("./review.controller");

const { authenticate, authorize } = require("../../middlewares/authMiddleware");

// Public routes
/**
 * @swagger
 * /reviews/course/{courseId}:
 *   get:
 *     summary: Get all reviews for a course
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of reviews
 */
router.get("/course/:courseId", getCourseReviews);
/**
 * @swagger
 * /reviews/course/{courseId}/rating:
 *   get:
 *     summary: Get average rating for a course
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course rating
 */
router.get("/course/:courseId/rating", getCourseRating);

// Student routes
/**
 * @swagger
 * /reviews/course/{courseId}:
 *   post:
 *     summary: Create a review for a course
 *     tags: [Reviews]
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
 *         description: Review created
 */
router.post(
  "/course/:courseId",
  authenticate,
  authorize("student"),
  createReview,
);
/**
 * @swagger
 * /reviews/{id}:
 *   put:
 *     summary: Update a review
 *     tags: [Reviews]
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
 *         description: Review updated
 */
router.put("/:id", authenticate, authorize("student"), updateReview);

// Student or Admin can delete
/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     summary: Delete a review
 *     tags: [Reviews]
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
 *         description: Review deleted
 */
router.delete(
  "/:id",
  authenticate,
  authorize("student", "admin"),
  deleteReview,
);

module.exports = router;
