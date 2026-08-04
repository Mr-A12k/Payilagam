const express = require('express');
const router = express.Router();

const {
    submitAssignment,
    getSubmissionsByAssignment,
    getStudentSubmissions,
    getMySubmissions,
    gradeSubmission,
    getSubmissionById,
} = require('./submission.controller');

const { authenticate, authorize } = require('../../middlewares/authMiddleware');

// All routes require authentication
router.use(authenticate);

// Student - get all my submissions across assignments
router.get('/my-submissions', authorize('student'), getMySubmissions);

// Student - submit an assignment
router.post('/assignment/:assignmentId', authorize('student'), submitAssignment);

// Mentor/Admin - get all submissions for an assignment
router.get('/assignment/:assignmentId', authorize('mentor', 'admin'), getSubmissionsByAssignment);

// Student - get my submissions for a specific assignment
router.get('/assignment/:assignmentId/my', authorize('student'), getStudentSubmissions);

// Get single submission (any authenticated user)
router.get('/:id', getSubmissionById);

// Mentor/Admin - grade a submission
router.put('/:id/grade', authorize('mentor', 'admin'), gradeSubmission);

module.exports = router;
