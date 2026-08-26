/**
 * @swagger
 * tags:
 *   name: Coding Problems
 *   description: Coding problem management and retrieval
 */
const express = require('express');
const router = express.Router();

const {
    create,
    getAll,
    getById,
    getBySlug,
    update,
    remove,
    getStats,
} = require('./codingProblem.controller');

const { authenticate, authorize } = require('../../middlewares/authMiddleware');

// All routes require authentication
router.use(authenticate);

// Public (authenticated) routes
/**
 * @swagger
 * /practice/coding-problems:
 *   get:
 *     summary: Get all coding problems
 *     tags: [Coding Problems]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of coding problems
 */
router.get('/', getAll);

/**
 * @swagger
 * /practice/coding-problems/slug/{slug}:
 *   get:
 *     summary: Get coding problem by slug
 *     tags: [Coding Problems]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Coding problem details
 */
router.get('/slug/:slug', getBySlug);

/**
 * @swagger
 * /practice/coding-problems/{id}:
 *   get:
 *     summary: Get coding problem by ID
 *     tags: [Coding Problems]
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
 *         description: Coding problem details
 */
router.get('/:id', getById);

/**
 * @swagger
 * /practice/coding-problems/{id}/stats:
 *   get:
 *     summary: Get coding problem stats
 *     tags: [Coding Problems]
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
 *         description: Coding problem stats
 */
router.get('/:id/stats', getStats);

// Mentor/Admin routes
/**
 * @swagger
 * /practice/coding-problems:
 *   post:
 *     summary: Create a new coding problem
 *     tags: [Coding Problems]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Coding problem created
 */
router.post('/', authorize('mentor', 'admin'), create);

/**
 * @swagger
 * /practice/coding-problems/{id}:
 *   put:
 *     summary: Update a coding problem
 *     tags: [Coding Problems]
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
 *         description: Coding problem updated
 */
router.put('/:id', authorize('mentor', 'admin'), update);

// Admin only
/**
 * @swagger
 * /practice/coding-problems/{id}:
 *   delete:
 *     summary: Delete a coding problem
 *     tags: [Coding Problems]
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
 *         description: Coding problem deleted
 */
router.delete('/:id', authorize('admin'), remove);

module.exports = router;
