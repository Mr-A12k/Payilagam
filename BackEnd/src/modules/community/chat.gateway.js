/**
 * @file chat.gateway.js
 * @description WebSocket event handlers for real-time chat functionality
 */
const chatService = require("./chat.service");

module.exports = (io, socket) => {
  const userId = socket.user.userId;

  // Join a specific conversation room to receive messages
  socket.on("join_chat", (conversationId) => {
    const roomName = `chat_${conversationId}`;
    socket.join(roomName);
    console.log(`User ${userId} joined room ${roomName}`);
  });

  // Leave a conversation room
  socket.on("leave_chat", (conversationId) => {
    const roomName = `chat_${conversationId}`;
    socket.leave(roomName);
    console.log(`User ${userId} left room ${roomName}`);
  });

  // Handle sending a new message
  socket.on("send_message", async (data, callback) => {
    try {
      const { conversationId, content } = data;

      // Save to database
      const message = await chatService.sendMessage(
        conversationId,
        userId,
        content,
      );

      // Broadcast the message to everyone in the room EXCEPT the sender
      socket.to(`chat_${conversationId}`).emit("new_message", message);

      // Acknowledge successful receipt to the sender (callback)
      if (typeof callback === "function") {
        callback({ success: true, message });
      }
    } catch (error) {
      console.error("Socket send_message error:", error);
      if (typeof callback === "function") {
        callback({ success: false, error: error.message });
      }
    }
  });

  // Handle typing indicators
  socket.on("typing", ({ conversationId, isTyping }) => {
    // Broadcast to everyone else in the room EXCEPT the sender
    socket.to(`chat_${conversationId}`).emit("user_typing", {
      userId,
      conversationId,
      isTyping,
    });
  });

  // Handle marking messages as read
  socket.on("mark_read", async (data) => {
    try {
      const { conversationId, messageIds } = data;
      if (messageIds && messageIds.length > 0) {
        await chatService.markMessagesAsRead(messageIds);
        // Notify the sender that their messages were read
        socket
          .to(`chat_${conversationId}`)
          .emit("messages_read", { conversationId, messageIds });
      }
    } catch (error) {
      console.error("Socket mark_read error:", error);
    }
  });

  // --- Channel / Workspace Sockets ---

  socket.on("join_channel", (channelId) => {
    const roomName = `channel_${channelId}`;
    socket.join(roomName);
    console.log(`User ${userId} joined channel ${roomName}`);
  });

  socket.on("leave_channel", (channelId) => {
    const roomName = `channel_${channelId}`;
    socket.leave(roomName);
    console.log(`User ${userId} left channel ${roomName}`);
  });

  socket.on("send_channel_message", async (data, callback) => {
    try {
      const { channelId, content, type, metadata } = data;

      const message = await chatService.sendChannelMessage(
        channelId,
        userId,
        content,
        type,
        metadata,
      );
      // Broadcast to everyone else in the channel EXCEPT the sender
      socket.to(`channel_${channelId}`).emit("new_channel_message", message);

      if (typeof callback === "function") {
        callback({ success: true, message });
      }
    } catch (error) {
      console.error("Socket send_channel_message error:", error);
      if (typeof callback === "function") {
        callback({ success: false, error: error.message });
      }
    }
  });

  socket.on("channel_typing", ({ channelId, isTyping }) => {
    socket.to(`channel_${channelId}`).emit("channel_user_typing", {
      userId,
      channelId,
      isTyping,
    });
  });
};
