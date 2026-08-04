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
router.get("/course/:courseId", getCourseReviews);
router.get("/course/:courseId/rating", getCourseRating);

// Student routes
router.post(
  "/course/:courseId",
  authenticate,
  authorize("student"),
  createReview,
);
router.put("/:id", authenticate, authorize("student"), updateReview);

// Student or Admin can delete
router.delete(
  "/:id",
  authenticate,
  authorize("student", "admin"),
  deleteReview,
);

module.exports = router;
