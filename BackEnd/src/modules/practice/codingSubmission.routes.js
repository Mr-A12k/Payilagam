/**
 * @swagger
 * tags:
 *   name: Coding Submissions
 *   description: Code execution and submission management
 */
const express = require('express');
const router = express.Router();

const {
    runCode,
    submitCode,
    getMySubmissions,
    getSubmissionById,
    getLeaderboard,
    getMyStats,
} = require('./codingSubmission.controller');

const { authenticate } = require('../../middlewares/authMiddleware');

// All routes require authentication
router.use(authenticate);

// User stats (must be before /:id to avoid matching 'my-stats' as an id)
/**
 * @swagger
 * /practice/submissions/my-stats:
 *   get:
 *     summary: Get current user's submission stats
 *     tags: [Coding Submissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User stats
 */
router.get('/my-stats', getMyStats);

// Problem-scoped routes
/**
 * @swagger
 * /practice/submissions/problem/{problemId}/run:
 *   post:
 *     summary: Run code without saving submission
 *     tags: [Coding Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: problemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Execution results
 */
router.post('/problem/:problemId/run', runCode);

/**
 * @swagger
 * /practice/submissions/problem/{problemId}/submit:
 *   post:
 *     summary: Submit code for evaluation
 *     tags: [Coding Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: problemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Evaluation results
 */
router.post('/problem/:problemId/submit', submitCode);

/**
 * @swagger
 * /practice/submissions/problem/{problemId}/my:
 *   get:
 *     summary: Get current user's submissions for a problem
 *     tags: [Coding Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: problemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of user's submissions
 */
router.get('/problem/:problemId/my', getMySubmissions);

/**
 * @swagger
 * /practice/submissions/problem/{problemId}/leaderboard:
 *   get:
 *     summary: Get leaderboard for a specific problem
 *     tags: [Coding Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: problemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Problem leaderboard
 */
router.get('/problem/:problemId/leaderboard', getLeaderboard);

// Individual submission
/**
 * @swagger
 * /practice/submissions/{id}:
 *   get:
 *     summary: Get submission by ID
 *     tags: [Coding Submissions]
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

module.exports = router;
