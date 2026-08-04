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
router.get('/my-stats', getMyStats);

// Problem-scoped routes
router.post('/problem/:problemId/run', runCode);
router.post('/problem/:problemId/submit', submitCode);
router.get('/problem/:problemId/my', getMySubmissions);
router.get('/problem/:problemId/leaderboard', getLeaderboard);

// Individual submission
router.get('/:id', getSubmissionById);

module.exports = router;
