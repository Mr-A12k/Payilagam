const express = require('express');
const router = express.Router();
const { getMentors, getMentorDetails, getActivity, searchUsers } = require('./user.controller');
const { authenticate } = require('../../middlewares/authMiddleware');

// Optional auth for public mentor viewing
const optionalAuth = (request, response, next) => {
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const jwt = require('jsonwebtoken');
        try {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            request.user = { userId: decoded.userId };
        } catch (error) {
            // Invalid token, ignore
        }
    }
    next();
};

router.get('/search', authenticate, searchUsers);
router.get('/activity', authenticate, getActivity);
router.get('/mentors', optionalAuth, getMentors);
router.get('/mentors/:id', optionalAuth, getMentorDetails);

module.exports = router;
