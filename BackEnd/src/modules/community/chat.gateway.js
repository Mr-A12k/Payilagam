/**
 * @file chat.gateway.js
 * @description WebSocket event handlers for real-time chat functionality
 */
const chatService = require("./chat.service");
const prisma = require("../../config/prisma");

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
      const result = await chatService.sendMessage(
        conversationId,
        userId,
        content,
      );
      const message = result.message;
      const otherParticipants = result.otherParticipants;

      // Broadcast the message to the specific chat room
      socket.to(`chat_${conversationId}`).emit("new_message", message);

      // Emit to each participant's global room so they get notified anywhere on the site
      if (otherParticipants && otherParticipants.length > 0) {
        otherParticipants.forEach((p) => {
          socket.to(`user_${p.userId}`).emit("new_message", message);
        });
      }

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

  // Handle editing a message
  socket.on("edit_message", async (data, callback) => {
    try {
      const { messageId, content } = data;
      const message = await chatService.editMessage(messageId, userId, content);
      
      // Broadcast to other participants in the conversation
      socket.to(`chat_${message.conversationId}`).emit("message_edited", message);

      if (typeof callback === "function") {
        callback({ success: true, message });
      }
    } catch (error) {
      console.error("Socket edit_message error:", error);
      if (typeof callback === "function") {
        callback({ success: false, error: error.message });
      }
    }
  });

  // Handle deleting a message
  socket.on("delete_message", async (data, callback) => {
    try {
      const { messageId } = data;
      const message = await prisma.message.findUnique({ where: { messageId } });
      if (!message) throw new Error("Message not found");

      await chatService.deleteMessage(messageId, userId);
      
      // Broadcast deletion to other participants
      socket.to(`chat_${message.conversationId}`).emit("message_deleted", { messageId, conversationId: message.conversationId });

      if (typeof callback === "function") {
        callback({ success: true });
      }
    } catch (error) {
      console.error("Socket delete_message error:", error);
      if (typeof callback === "function") {
        callback({ success: false, error: error.message });
      }
    }
  });

  // Handle editing a channel message
  socket.on("edit_channel_message", async (data, callback) => {
    try {
      const { messageId, content } = data;
      const message = await chatService.editChannelMessage(messageId, userId, content);
      
      // Broadcast to other channel members
      socket.to(`channel_${message.channelId}`).emit("channel_message_edited", message);

      if (typeof callback === "function") {
        callback({ success: true, message });
      }
    } catch (error) {
      console.error("Socket edit_channel_message error:", error);
      if (typeof callback === "function") {
        callback({ success: false, error: error.message });
      }
    }
  });

  // Handle deleting a channel message
  socket.on("delete_channel_message", async (data, callback) => {
    try {
      const { messageId } = data;
      const message = await prisma.channelMessage.findUnique({ where: { messageId } });
      if (!message) throw new Error("Message not found");

      await chatService.deleteChannelMessage(messageId, userId);
      
      // Broadcast to other channel members
      socket.to(`channel_${message.channelId}`).emit("channel_message_deleted", { messageId, channelId: message.channelId });

      if (typeof callback === "function") {
        callback({ success: true });
      }
    } catch (error) {
      console.error("Socket delete_channel_message error:", error);
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
