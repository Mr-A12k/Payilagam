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

const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

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

/**
 * @swagger
 * /ai/image/verify:
 *   post:
 *     summary: Verify if an image is AI generated
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Verification result
 */
router.post("/image/verify", authenticate, upload.single("image"), aiController.verifyImage);

/**
 * @swagger
 * /ai/image/strip-metadata:
 *   post:
 *     summary: Strip metadata from an image
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cleaned image
 */
router.post("/image/strip-metadata", authenticate, upload.single("image"), aiController.stripMetadata);

module.exports = router;
