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
router.get("/published", getPublished);

// Authenticated routes
router.get(
  "/mentor/stats",
  authenticate,
  authorize("mentor", "admin"),
  getMentorStats,
);
router.get(
  "/mentor/my-courses",
  authenticate,
  authorize("mentor", "admin"),
  getMyCourses,
);
router.get("/", authenticate, getAll);
router.get("/:uniqueId", getById);

// Mentor and admin routes
router.post(
  "/",
  authenticate,
  authorize("mentor", "admin"),
  upload.single("thumbnail"),
  create,
);
router.put(
  "/:uniqueId",
  authenticate,
  authorize("mentor", "admin"),
  upload.single("thumbnail"),
  update,
);
router.post(
  "/:uniqueId/request-deletion",
  authenticate,
  authorize("mentor"),
  requestDeletion,
);

// Admin only
router.delete("/:uniqueId", authenticate, authorize("admin"), remove);

module.exports = router;
