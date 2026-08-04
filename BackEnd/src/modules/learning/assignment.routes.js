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
router.get("/upcoming", authorize("student"), getUpcomingAssignments);

// Get all assignments for a course (any authenticated user)
router.get("/course/:courseId", getAssignmentsByCourse);

// Get single assignment
router.get("/:id", getAssignmentById);

// Mentor/Admin - create assignment
router.post("/", authorize("mentor", "admin"), createAssignment);

// Mentor/Admin - update assignment
router.put("/:id", authorize("mentor", "admin"), updateAssignment);

// Mentor/Admin - delete assignment
router.delete("/:id", authorize("mentor", "admin"), deleteAssignment);

module.exports = router;
