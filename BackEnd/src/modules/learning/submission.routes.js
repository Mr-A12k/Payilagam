/**
 * @swagger
 * tags:
 *   name: Submissions
 *   description: Assignment submission endpoints
 */
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
/**
 * @swagger
 * /submissions/my-submissions:
 *   get:
 *     summary: Get all my submissions across assignments
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of my submissions
 */
router.get('/my-submissions', authorize('student'), getMySubmissions);

// Student - submit an assignment
/**
 * @swagger
 * /submissions/assignment/{assignmentId}:
 *   post:
 *     summary: Submit an assignment
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Assignment submitted
 */
router.post('/assignment/:assignmentId', authorize('student'), submitAssignment);

// Mentor/Admin - get all submissions for an assignment
/**
 * @swagger
 * /submissions/assignment/{assignmentId}:
 *   get:
 *     summary: Get all submissions for an assignment
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of submissions
 */
router.get('/assignment/:assignmentId', authorize('mentor', 'admin'), getSubmissionsByAssignment);

// Student - get my submissions for a specific assignment
/**
 * @swagger
 * /submissions/assignment/{assignmentId}/my:
 *   get:
 *     summary: Get my submissions for a specific assignment
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of my submissions for this assignment
 */
router.get('/assignment/:assignmentId/my', authorize('student'), getStudentSubmissions);

// Get single submission (any authenticated user)
/**
 * @swagger
 * /submissions/{id}:
 *   get:
 *     summary: Get single submission
 *     tags: [Submissions]
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
 *         description: Submission details
 */
router.get('/:id', getSubmissionById);

// Mentor/Admin - grade a submission
/**
 * @swagger
 * /submissions/{id}/grade:
 *   put:
 *     summary: Grade a submission
 *     tags: [Submissions]
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
 *         description: Submission graded
 */
router.put('/:id/grade', authorize('mentor', 'admin'), gradeSubmission);

module.exports = router;
