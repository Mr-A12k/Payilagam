const express = require('express');
const router = express.Router();
const aiController = require('./ai.controller');
const { authenticate } = require('../../middlewares/authMiddleware');

// Using POST for SSE because we are sending query payload in body
router.post('/chat', authenticate, aiController.chat);

module.exports = router;
