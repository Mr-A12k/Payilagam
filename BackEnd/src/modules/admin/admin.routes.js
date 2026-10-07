/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management and analytics
 */
const express = require("express");
const router = express.Router();

const {
  getDashboard,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  resetPassword,
  getAllRoles,
  createRole,
  getEnrollmentAnalytics,
  getCourseAnalytics,
  getSystemLogs,
  getAllProblemTags,
  deleteProblemTag,
} = require("./admin.controller");

const { authenticate, authorize } = require("../../middlewares/authMiddleware");

// All admin routes require admin authentication
router.use(authenticate, authorize("admin"));

// Dashboard
/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Get dashboard stats
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get("/dashboard", getDashboard);
/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Get dashboard stats (alias)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get("/stats", getDashboard); // alias
/**
 * @swagger
 * /admin/logs:
 *   get:
 *     summary: Get system logs
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get("/logs", getSystemLogs);

// User management
/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
router.get("/users", getAllUsers);
/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Admin]
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
 *         description: User details
 */
router.get("/users/:id", getUserById);
/**
 * @swagger
 * /admin/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: User created
 */
router.post("/users", createUser);
/**
 * @swagger
 * /admin/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Admin]
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
 *         description: User updated
 */
router.put("/users/:id", updateUser);
/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Admin]
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
 *         description: User deleted
 */
router.delete("/users/:id", deleteUser);
/**
 * @swagger
 * /admin/users/{id}/toggle-status:
 *   put:
 *     summary: Toggle user status
 *     tags: [Admin]
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
 *         description: Status toggled
 */
router.put("/users/:id/toggle-status", toggleUserStatus);
/**
 * @swagger
 * /admin/users/{id}/reset-password:
 *   put:
 *     summary: Reset user password
 *     tags: [Admin]
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
 *         description: Password reset
 */
router.put("/users/:id/reset-password", resetPassword);

// Role management
/**
 * @swagger
 * /admin/roles:
 *   get:
 *     summary: Get all roles
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of roles
 */
router.get("/roles", getAllRoles);
/**
 * @swagger
 * /admin/roles:
 *   post:
 *     summary: Create a role
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Role created
 */
router.post("/roles", createRole);

// Analytics
/**
 * @swagger
 * /admin/analytics/enrollments:
 *   get:
 *     summary: Get enrollment analytics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Enrollment analytics data
 */
router.get("/analytics/enrollments", getEnrollmentAnalytics);
/**
 * @swagger
 * /admin/analytics/courses:
 *   get:
 *     summary: Get course analytics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Course analytics data
 */
router.get("/analytics/courses", getCourseAnalytics);

const dropdownOptionRoutes = require('./dropdownOption.routes.js');
router.use('/dropdown-options', dropdownOptionRoutes.adminRouter);

router.get("/problem-tags", getAllProblemTags);
router.delete("/problem-tags/:id", deleteProblemTag);

module.exports = router;
