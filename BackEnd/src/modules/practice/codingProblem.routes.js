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
router.get('/', getAll);
router.get('/slug/:slug', getBySlug);
router.get('/:id', getById);
router.get('/:id/stats', getStats);

// Mentor/Admin routes
router.post('/', authorize('mentor', 'admin'), create);
router.put('/:id', authorize('mentor', 'admin'), update);

// Admin only
router.delete('/:id', authorize('admin'), remove);

module.exports = router;
