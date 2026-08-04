const express = require('express');
const router = express.Router();
const { runCode, shareCode, getShared, getLanguages } = require('./labs.controller');
const { authenticate } = require('../../middlewares/authMiddleware');

// Optional auth middleware — attaches user if token present, but does not block
const optionalAuth = (request, response, next) => {
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const jwt = require('jsonwebtoken');
        try {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            request.user = { userId: decoded.userId };
        } catch (error) {
            // Invalid token — continue as guest
        }
    }
    next();
};

router.get('/languages', getLanguages);             // Public
router.post('/run', optionalAuth, runCode);          // Public (guest allowed, user saved)
router.post('/share', optionalAuth, shareCode);      // Public
router.get('/share/:slug', getShared);               // Public

module.exports = router;
