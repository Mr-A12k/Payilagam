/**
 * @swagger
 * tags:
 *   name: Practice Stats
 *   description: Overall practice statistics and leaderboard
 */
const express = require('express');
const router = express.Router();
const { getMyStats, getLeaderboard, getDailyChallenge } = require('./practiceStats.controller');
const { authenticate } = require('../../middlewares/authMiddleware');

const optionalAuth = (request, response, next) => {
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const jwt = require('jsonwebtoken');
        try {
            request.user = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
        } catch (error) {}
    }
    next();
};

/**
 * @swagger
 * /practice/stats/stats:
 *   get:
 *     summary: Get current user's overall practice stats
 *     tags: [Practice Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Practice stats
 */
router.get('/stats', authenticate, getMyStats);              // Auth required

/**
 * @swagger
 * /practice/stats/leaderboard:
 *   get:
 *     summary: Get overall practice leaderboard
 *     tags: [Practice Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Leaderboard data
 */
router.get('/leaderboard', optionalAuth, getLeaderboard);    // Public (restricted), full when auth

/**
 * @swagger
 * /practice/stats/daily-challenge:
 *   get:
 *     summary: Get the daily coding challenge
 *     tags: [Practice Stats]
 *     responses:
 *       200:
 *         description: Daily challenge problem
 */
router.get('/daily-challenge', getDailyChallenge);            // Public

module.exports = router;
