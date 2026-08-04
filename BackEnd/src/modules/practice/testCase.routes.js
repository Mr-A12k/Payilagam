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
router.get('/problem/:problemId', getTestCases);
router.post('/problem/:problemId', addTestCase);
router.post('/problem/:problemId/bulk', bulkAddTestCases);

// Individual test case routes
router.put('/:id', updateTestCase);
router.delete('/:id', deleteTestCase);

module.exports = router;
