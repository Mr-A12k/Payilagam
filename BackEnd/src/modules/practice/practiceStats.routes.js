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

router.get('/stats', authenticate, getMyStats);              // Auth required
router.get('/leaderboard', optionalAuth, getLeaderboard);    // Public (restricted), full when auth
router.get('/daily-challenge', getDailyChallenge);            // Public

module.exports = router;
