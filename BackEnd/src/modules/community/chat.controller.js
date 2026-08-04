const chatService = require("./chat.service");
const catchAsync = require("../../utils/catchAsync");
const { success } = require("../../utils/responseHelper");

const getConversations = catchAsync(async (request, response) => {
  const role = request.user.role;
  const userId = request.user.userId;
  const conversations = await chatService.getConversations(userId, role);
  return success(
    response,
    conversations,
    "Conversations retrieved successfully",
  );
});

const getOrCreateConversation = catchAsync(async (request, response) => {
  const { targetUserId } = request.body;
  const userId = request.user.userId;
  const conversation = await chatService.getOrCreateConversation(
    userId,
    targetUserId,
  );
  return success(response, conversation, "Conversation retrieved successfully");
});

const getMessages = catchAsync(async (request, response) => {
  const conversationId = parseInt(request.params.id);
  const userId = request.user.userId;
  const role = request.user.role;
  const messages = await chatService.getMessages(conversationId, userId, role);
  return success(response, messages, "Messages retrieved successfully");
});

const sendMessage = catchAsync(async (request, response) => {
  const conversationId = parseInt(request.params.id);
  const senderId = request.user.userId;
  const { content } = request.body;

  const message = await chatService.sendMessage(
    conversationId,
    senderId,
    content,
  );
  return success(response, message, "Message sent successfully");
});

const getWorkspaces = catchAsync(async (request, response) => {
  const role = request.user.role;
  const userId = request.user.userId;
  const workspaces = await chatService.getWorkspaces(userId, role);
  return success(response, workspaces, "Workspaces retrieved successfully");
});

const getChannelMessages = catchAsync(async (request, response) => {
  const channelId = parseInt(request.params.channelId);
  const cursor = request.query.cursor;
  const messages = await chatService.getChannelMessages(channelId, cursor);
  return success(response, messages, "Channel messages retrieved successfully");
});

const sendChannelMessage = catchAsync(async (request, response) => {
  const channelId = parseInt(request.params.channelId);
  const senderId = request.user.userId;
  const { content, type, metadata } = request.body;

  const message = await chatService.sendChannelMessage(
    channelId,
    senderId,
    content,
    type,
    metadata,
  );
  return success(response, message, "Channel message sent successfully");
});

module.exports = {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  getWorkspaces,
  getChannelMessages,
  sendChannelMessage,
};
