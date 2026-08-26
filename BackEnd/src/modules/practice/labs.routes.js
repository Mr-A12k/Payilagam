/**
 * @swagger
 * tags:
 *   name: Labs
 *   description: Practice labs and code sharing
 */
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

/**
 * @swagger
 * /practice/labs/languages:
 *   get:
 *     summary: Get supported programming languages
 *     tags: [Labs]
 *     responses:
 *       200:
 *         description: List of supported languages
 */
router.get('/languages', getLanguages);             // Public

/**
 * @swagger
 * /practice/labs/run:
 *   post:
 *     summary: Run lab code
 *     tags: [Labs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Execution results
 */
router.post('/run', optionalAuth, runCode);          // Public (guest allowed, user saved)

/**
 * @swagger
 * /practice/labs/share:
 *   post:
 *     summary: Share lab code
 *     tags: [Labs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Code shared successfully
 */
router.post('/share', optionalAuth, shareCode);      // Public

/**
 * @swagger
 * /practice/labs/share/{slug}:
 *   get:
 *     summary: Get shared lab code by slug
 *     tags: [Labs]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Shared code details
 */
router.get('/share/:slug', getShared);               // Public

module.exports = router;
