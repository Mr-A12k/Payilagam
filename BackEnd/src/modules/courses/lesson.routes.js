const express = require('express');
const router = express.Router();

const {
    createLesson,
    getLessonsByModule,
    getLessonById,
    updateLesson,
    deleteLesson,
} = require('./lesson.controller');

const { authenticate, authorize } = require('../../middlewares/authMiddleware');

// All routes require authentication
router.use(authenticate);

// Get all lessons for a module
router.get('/module/:moduleId', getLessonsByModule);

// Get a single lesson (includes student progress if role is student)
router.get('/:id', getLessonById);

// Create a lesson for a module (mentor/admin only)
router.post('/module/:moduleId', authorize('mentor', 'admin'), createLesson);

// Update a lesson (mentor/admin only)
router.put('/:id', authorize('mentor', 'admin'), updateLesson);

// Delete a lesson (mentor/admin only)
router.delete('/:id', authorize('mentor', 'admin'), deleteLesson);

module.exports = router;
