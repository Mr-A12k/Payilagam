const chatService = require('./chat.service');
const prisma = require('../../config/prisma');
const jwt = require('jsonwebtoken');
const { id } = require('./validation');

// Recheck account state and token lifetime on events and delivery.
const activeUser = async (socket) => {
  const decoded = jwt.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
  const userId = id(decoded.userId);
  const user = await prisma.user.findUnique({ where: { userId }, include: { role: true } });
  if (!user || !user.isActive) throw new Error('Account unavailable');
  return user;
};

module.exports = (io, socket) => {
  const ready = activeUser(socket).catch(() => { socket.disconnect(true); return null; });
  const on = (event, handler) => socket.on(event, async (data, callback) => {
    try {
      if (!await ready) throw new Error('Authentication required');
      const user = await activeUser(socket);
      const result = await handler(data, user.userId, user.role.roleName);
      if (typeof callback === 'function') callback({ success: true, ...result });
    } catch (error) {
      if (typeof callback === 'function') callback({ success: false, error: error.message });
    }
  });
  const conversation = async (value, userId, role) => {
    const conversationId = id(value);
    if (role === 'admin') {
      if (!await prisma.conversation.findUnique({ where: { conversationId } })) throw new Error('Conversation not found');
    } else await chatService.requireParticipant(conversationId, userId);
    return conversationId;
  };
  const channel = async (value, userId, role) => {
    const channelId = id(value);
    await chatService.authorizeChannel(channelId, userId, role);
    return channelId;
  };
  const payload = (data) => {
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid event payload');
    return data;
  };
  const typing = (data) => {
    if (typeof data.isTyping !== 'boolean') throw new Error('Invalid typing state');
  };

  // Membership can be revoked while a socket is still subscribed to a room.
  const broadcast = async (rooms, event, data, authorize) => {
    const recipients = await io.in(rooms).fetchSockets();
    for (const recipient of recipients) {
      if (recipient.id === socket.id) continue;
      try {
        const recipientUser = await activeUser(recipient);
        await authorize(recipientUser.userId, recipientUser.role.roleName);
        recipient.emit(event, await chatService.replyForRecipient(data, recipientUser.userId));
      } catch {
        for (const room of rooms) if (!room.startsWith('user_')) await recipient.leave(room);
      }
    }
  };

  on('join_chat', async (value, userId, role) => { await socket.join(`chat_${await conversation(value, userId, role)}`); });
  on('leave_chat', async (value) => { await socket.leave(`chat_${id(value)}`); });
  on('join_channel', async (value, userId, role) => { await socket.join(`channel_${await channel(value, userId, role)}`); });
  on('leave_channel', async (value) => { await socket.leave(`channel_${id(value)}`); });

  on('send_message', async (input, userId) => {
    const data = payload(input);
    const conversationId = await conversation(data.conversationId, userId);
    const { message, otherParticipants } = await chatService.sendMessage(conversationId, userId, data.content, data.replyToId);
    const rooms = [`chat_${conversationId}`, ...otherParticipants.map(p => `user_${p.userId}`)];
    await broadcast(rooms, 'new_message', message, (recipientId, role) => conversation(conversationId, recipientId, role));
    return { message };
  });
  on('send_channel_message', async (input, userId) => {
    const data = payload(input);
    const channelId = await channel(data.channelId, userId);
    const message = await chatService.sendChannelMessage(channelId, userId, data.content, data.type, data.metadata, data.replyToId);
    await broadcast([`channel_${channelId}`], 'new_channel_message', message, (recipientId, role) => channel(channelId, recipientId, role));
    return { message };
  });
  for (const [event, service, emitted, isChannel, deleting] of [
    ['edit_message', 'editMessage', 'message_edited', false, false],
    ['delete_message', 'deleteMessage', 'message_deleted', false, true],
    ['edit_channel_message', 'editChannelMessage', 'channel_message_edited', true, false],
    ['delete_channel_message', 'deleteChannelMessage', 'channel_message_deleted', true, true],
  ]) {
    on(event, async (input, userId) => {
      const data = payload(input);
      const message = await chatService[service](id(data.messageId), userId, data.content);
      const resourceId = isChannel ? message.channelId : message.conversationId;
      const authorize = isChannel ? channel : conversation;
      const room = `${isChannel ? 'channel' : 'chat'}_${resourceId}`;
      const result = deleting ? { messageId: message.messageId, [isChannel ? 'channelId' : 'conversationId']: resourceId } : message;
      await broadcast([room], emitted, result, (recipientId, role) => authorize(resourceId, recipientId, role));
      return deleting ? {} : { message };
    });
  }
  on('typing', async (input, userId) => {
    const data = payload(input); typing(data);
    const conversationId = await conversation(data.conversationId, userId);
    await broadcast([`chat_${conversationId}`], 'user_typing', { userId, conversationId, isTyping: data.isTyping }, (recipientId, role) => conversation(conversationId, recipientId, role));
  });
  on('channel_typing', async (input, userId) => {
    const data = payload(input); typing(data);
    const channelId = await channel(data.channelId, userId);
    await broadcast([`channel_${channelId}`], 'channel_user_typing', { userId, channelId, isTyping: data.isTyping }, (recipientId, role) => channel(channelId, recipientId, role));
  });
  on('mark_read', async (input, userId) => {
    const data = payload(input);
    const conversationId = await conversation(data.conversationId, userId);
    await chatService.markMessagesAsRead(data.messageIds, conversationId, userId);
    const messageIds = [...new Set(data.messageIds.map(id))];
    await broadcast([`chat_${conversationId}`], 'messages_read', { conversationId, messageIds }, (recipientId, role) => conversation(conversationId, recipientId, role));
  });
};
