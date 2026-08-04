const express = require('express');
const router = express.Router();

const {
    enroll,
    unenroll,
    getMyEnrollments,
    getCourseEnrollments,
    checkEnrollment,
    getEnrollmentStats,
} = require('./enrollment.controller');

const { authenticate, authorize } = require('../../middlewares/authMiddleware');

// Student routes (accessible to anyone)
router.post('/:courseId/enroll', authenticate, enroll);
router.delete('/:courseId/unenroll', authenticate, unenroll);
router.get('/my-courses', authenticate, getMyEnrollments);

// Mentor/Admin routes
router.get('/course/:courseId/students', authenticate, authorize('mentor', 'admin'), getCourseEnrollments);
router.get('/stats/:courseId', authenticate, authorize('mentor', 'admin'), getEnrollmentStats);

// Authenticated route (any role)
router.get('/check/:courseId', authenticate, checkEnrollment);

module.exports = router;
