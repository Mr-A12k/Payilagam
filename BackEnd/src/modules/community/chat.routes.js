const express = require("express");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Chat and messaging endpoints
 */
const { authenticate } = require("../../middlewares/authMiddleware");
const {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  getWorkspaces,
  getChannelMessages,
  sendChannelMessage,
  createWorkspace,
  updateWorkspace,
  addWorkspaceMember,
  joinWorkspace,
} = require("./chat.controller");

router.use(authenticate);

// Legacy 1-on-1 DM routes
/**
 * @swagger
 * /chat:
 *   get:
 *     summary: Get conversations
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/", getConversations);
/**
 * @swagger
 * /chat:
 *   post:
 *     summary: Get or create conversation
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 */
router.post("/", getOrCreateConversation);
/**
 * @swagger
 * /chat/{id}/messages:
 *   get:
 *     summary: Get messages for a conversation
 *     tags: [Chat]
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
 *         description: OK
 */
router.get("/:id/messages", getMessages);
/**
 * @swagger
 * /chat/{id}/messages:
 *   post:
 *     summary: Send a message to a conversation
 *     tags: [Chat]
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
 *         description: OK
 */
router.post("/:id/messages", sendMessage);

// New Workspace/Channel routes
/**
 * @swagger
 * /chat/workspaces:
 *   get:
 *     summary: Get workspaces
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/workspaces", getWorkspaces);
/**
 * @swagger
 * /chat/channels/{channelId}/messages:
 *   get:
 *     summary: Get messages for a channel
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/channels/:channelId/messages", getChannelMessages);
/**
 * @swagger
 * /chat/channels/{channelId}/messages:
 *   post:
 *     summary: Send a message to a channel
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.post("/channels/:channelId/messages", sendChannelMessage);

// Workspace Group Management Routes
router.post("/workspaces", createWorkspace);
router.put("/workspaces/:id", updateWorkspace);
router.post("/workspaces/:id/members", addWorkspaceMember);
router.post("/workspaces/join", joinWorkspace);

module.exports = router;
