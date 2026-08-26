/**
 * @swagger
 * tags:
 *   name: Test Cases
 *   description: Test case management for coding problems
 */
const express = require('express');
const router = express.Router();

const {
    getTestCases,
    addTestCase,
    bulkAddTestCases,
    updateTestCase,
    deleteTestCase,
} = require('./testCase.controller');

const { authenticate, authorize } = require('../../middlewares/authMiddleware');

// All test case management routes require mentor/admin
router.use(authenticate);
router.use(authorize('mentor', 'admin'));

// Problem-scoped routes
/**
 * @swagger
 * /practice/test-cases/problem/{problemId}:
 *   get:
 *     summary: Get test cases for a problem
 *     tags: [Test Cases]
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
 *         description: List of test cases
 */
router.get('/problem/:problemId', getTestCases);

/**
 * @swagger
 * /practice/test-cases/problem/{problemId}:
 *   post:
 *     summary: Add a test case for a problem
 *     tags: [Test Cases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: problemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Test case created
 */
router.post('/problem/:problemId', addTestCase);

/**
 * @swagger
 * /practice/test-cases/problem/{problemId}/bulk:
 *   post:
 *     summary: Bulk add test cases for a problem
 *     tags: [Test Cases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: problemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Test cases created
 */
router.post('/problem/:problemId/bulk', bulkAddTestCases);

// Individual test case routes
/**
 * @swagger
 * /practice/test-cases/{id}:
 *   put:
 *     summary: Update a test case
 *     tags: [Test Cases]
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
 *         description: Test case updated
 */
router.put('/:id', updateTestCase);

/**
 * @swagger
 * /practice/test-cases/{id}:
 *   delete:
 *     summary: Delete a test case
 *     tags: [Test Cases]
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
 *         description: Test case deleted
 */
router.delete('/:id', deleteTestCase);

module.exports = router;
