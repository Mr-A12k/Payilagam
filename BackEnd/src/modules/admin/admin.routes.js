const express = require('express');
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
} = require('./admin.controller');

const { authenticate, authorize } = require('../../middlewares/authMiddleware');

// All admin routes require admin authentication
router.use(authenticate, authorize('admin'));

// Dashboard
router.get('/dashboard', getDashboard);
router.get('/stats', getDashboard); // alias
router.get('/logs', getSystemLogs);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.put('/users/:id/reset-password', resetPassword);

// Role management
router.get('/roles', getAllRoles);
router.post('/roles', createRole);

// Analytics
router.get('/analytics/enrollments', getEnrollmentAnalytics);
router.get('/analytics/courses', getCourseAnalytics);

module.exports = router;
