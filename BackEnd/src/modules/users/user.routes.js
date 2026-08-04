/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User operations
 */
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

/**
 * @swagger
 * /users/search:
 *   get:
 *     summary: Search users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of matching users
 */
router.get('/search', authenticate, searchUsers);
/**
 * @swagger
 * /users/activity:
 *   get:
 *     summary: Get user activity
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User activity data
 */
router.get('/activity', authenticate, getActivity);
/**
 * @swagger
 * /users/mentors:
 *   get:
 *     summary: Get all mentors
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of mentors
 */
router.get('/mentors', optionalAuth, getMentors);
/**
 * @swagger
 * /users/mentors/{id}:
 *   get:
 *     summary: Get mentor details by ID
 *     tags: [Users]
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
 *         description: Mentor details
 */
router.get('/mentors/:id', optionalAuth, getMentorDetails);

module.exports = router;
