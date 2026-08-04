const express = require('express');
const router = express.Router();

const {
    create,
    getAll,
    getById,
    update,
    remove,
    toggleResolved,
    upvote,
    createReply,
    updateReply,
    deleteReply,
    upvoteReply,
} = require('./discussion.controller');

const { authenticate } = require('../../middlewares/authMiddleware');
const { validate, validationRules } = require('../../middlewares/validators');

// Discussion routes
router.get('/', authenticate, getAll);
router.get('/:id', authenticate, getById);
router.post('/', authenticate, validate(validationRules.createDiscussion), create);
router.put('/:id', authenticate, update);
router.delete('/:id', authenticate, remove);
router.put('/:id/resolve', authenticate, toggleResolved);
router.post('/:id/upvote', authenticate, upvote);

// Reply routes
router.post('/:discussionId/replies', authenticate, createReply);
router.put('/replies/:replyId', authenticate, updateReply);
router.delete('/replies/:replyId', authenticate, deleteReply);
router.post('/replies/:replyId/upvote', authenticate, upvoteReply);

module.exports = router;
