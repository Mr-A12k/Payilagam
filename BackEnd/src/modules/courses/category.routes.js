const express = require('express');
const router = express.Router();

const {
    create,
    getAll,
    getById,
    update,
    remove,
} = require('./category.controller');

const { authenticate, authorize } = require('../../middlewares/authMiddleware');

// Public routes
router.get('/', getAll);
router.get('/:id', getById);

// Admin only routes
router.post('/', authenticate, authorize('admin'), create);
router.put('/:id', authenticate, authorize('admin'), update);
router.delete('/:id', authenticate, authorize('admin'), remove);

module.exports = router;
