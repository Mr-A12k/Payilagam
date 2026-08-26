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

const createWorkspace = catchAsync(async (request, response) => {
  const { name, description } = request.body;
  const ownerId = request.user.userId;
  const role = request.user.role;

  if (role !== "admin" && role !== "mentor") {
    return response.status(403).json({ success: false, message: "Only mentors and admins can create groups" });
  }

  const workspace = await chatService.createWorkspace(name, description, ownerId);
  return success(response, workspace, "Workspace created successfully");
});

const updateWorkspace = catchAsync(async (request, response) => {
  const workspaceId = parseInt(request.params.id);
  const { name, description } = request.body;
  const userId = request.user.userId;
  const role = request.user.role;

  try {
    const workspace = await chatService.updateWorkspace(workspaceId, name, description, userId, role);
    return success(response, workspace, "Workspace updated successfully");
  } catch (error) {
    return response.status(403).json({ success: false, message: error.message });
  }
});

const addWorkspaceMember = catchAsync(async (request, response) => {
  const workspaceId = parseInt(request.params.id);
  const { userId } = request.body;
  const member = await chatService.addWorkspaceMember(workspaceId, parseInt(userId));
  return success(response, member, "Member added successfully");
});

const joinWorkspace = catchAsync(async (request, response) => {
  const workspaceId = parseInt(request.body.workspaceId);
  const userId = request.user.userId;
  const member = await chatService.addWorkspaceMember(workspaceId, userId);
  return success(response, member, "Joined workspace successfully");
});

const deleteConversation = catchAsync(async (request, response) => {
  const conversationId = parseInt(request.params.id);
  const userId = request.user.userId;
  await chatService.deleteConversation(conversationId, userId);
  return success(response, null, "Conversation deleted successfully");
});

const clearConversation = catchAsync(async (request, response) => {
  const conversationId = parseInt(request.params.id);
  const userId = request.user.userId;
  await chatService.clearConversation(conversationId, userId);
  return success(response, null, "Chat cleared successfully");
});

module.exports = {
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
  deleteConversation,
  clearConversation,
};
