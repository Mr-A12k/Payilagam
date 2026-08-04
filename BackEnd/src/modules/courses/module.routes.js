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
router.get("/course/:courseId", getModulesByCourse);

// Get a single module with lessons
router.get("/:id", getModuleById);

// Create a module for a course (mentor/admin only)
router.post("/course/:courseId", authorize("mentor", "admin"), createModule);

// Reorder modules for a course (mentor/admin only)
// NOTE: This must come BEFORE PUT /:id to avoid route conflicts
router.put(
  "/course/:courseId/reorder",
  authorize("mentor", "admin"),
  reorderModules,
);

// Update a module (mentor/admin only)
router.put("/:id", authorize("mentor", "admin"), updateModule);

// Delete a module (mentor/admin only)
router.delete("/:id", authorize("mentor", "admin"), deleteModule);

module.exports = router;
