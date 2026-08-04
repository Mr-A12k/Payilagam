/**
 * @swagger
 * tags:
 *   name: AI
 *   description: AI interaction routes
 */
const express = require("express");
const router = express.Router();
const aiController = require("./ai.controller");
const { authenticate } = require("../../middlewares/authMiddleware");

// Using POST for SSE because we are sending query payload in body
/**
 * @swagger
 * /ai/chat:
 *   post:
 *     summary: Chat with AI
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: AI response stream
 */
router.post("/chat", authenticate, aiController.chat);

module.exports = router;
