const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middlewares/authMiddleware');
const {
    getConversations,
    getOrCreateConversation,
    getMessages,
    sendMessage,
    getWorkspaces,
    getChannelMessages,
    sendChannelMessage
} = require('./chat.controller');

router.use(authenticate);

// Legacy 1-on-1 DM routes
router.get('/', getConversations);
router.post('/', getOrCreateConversation);
router.get('/:id/messages', getMessages);
router.post('/:id/messages', sendMessage);

// New Workspace/Channel routes
router.get('/workspaces', getWorkspaces);
router.get('/channels/:channelId/messages', getChannelMessages);
router.post('/channels/:channelId/messages', sendChannelMessage);

module.exports = router;
