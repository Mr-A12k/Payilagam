const express = require('express');
const router = express.Router();

const {
    markLessonComplete,
    markLessonIncomplete,
    updateWatchTime,
    getCourseProgress,
    getStudentDashboard,
} = require('./progress.controller');

const { authenticate, authorize } = require('../../middlewares/authMiddleware');

// All progress routes are student-only
router.post('/lesson/:lessonId/complete', authenticate, authorize('student'), markLessonComplete);
router.post('/lesson/:lessonId/incomplete', authenticate, authorize('student'), markLessonIncomplete);
router.put('/lesson/:lessonId/watch-time', authenticate, authorize('student'), updateWatchTime);
router.get('/course/:courseId', authenticate, authorize('student'), getCourseProgress);
router.get('/dashboard', authenticate, authorize('student'), getStudentDashboard);

module.exports = router;
