const prisma = require("../../config/prisma");
const AppError = require('../../utils/AppError');
const { id, text } = require('./validation');
const replyInclude = { select: { messageId: true, content: true, isDeleted: true, createdAt: true, sender: { select: { userId: true, fullName: true } } } };
const withReply = (message, clearedAt) => {
  if (message.replyTo && (message.replyTo.isDeleted || (clearedAt && message.replyTo.createdAt <= clearedAt))) {
    return { ...message, replyTo: { messageId: message.replyTo.messageId, isDeleted: true, content: null, sender: null } };
  }
  return message;
};
const validateReply = async (model, replyToId, scope, clearedAt) => {
  if (replyToId == null) return null;
  replyToId = id(replyToId);
  const target = await model.findUnique({ where: { messageId: replyToId } });
  if (!target || target.isDeleted || Object.entries(scope).some(([key, value]) => target[key] !== value) || (clearedAt && target.createdAt <= clearedAt)) {
    throw new AppError('Reply target is unavailable in this chat', 400);
  }
  return replyToId;
};
const replyForRecipient = async (message, userId) => {
  if (!message.conversationId || !message.replyTo) return message;
  const participant = await prisma.conversationParticipant.findUnique({ where: { conversationId_userId: { conversationId: message.conversationId, userId } } });
  return withReply(message, participant?.clearedAt);
};
const requireParticipant = async (conversationId, userId) => {
  id(conversationId);
  if (!await prisma.conversation.findUnique({ where: { conversationId } })) throw new AppError('Conversation not found', 404);
  const participant = await prisma.conversationParticipant.findUnique({ where: { conversationId_userId: { conversationId, userId } } });
  if (!participant) throw new AppError('Access denied', 403);
};

const authorizeWorkspaceManager = async (workspaceId, userId, role) => {
  const workspace = await prisma.workspace.findUnique({ where: { workspaceId } });
  if (!workspace) throw new AppError('Workspace not found', 404);
  if (workspace.ownerId !== userId && role !== 'admin') throw new AppError('Access denied', 403);
  return workspace;
};
const authorizeChannel = async (channelId, userId, role) => {
  id(channelId);
  const channel = await prisma.channel.findUnique({ where: { channelId }, include: { workspace: true } });
  if (!channel) throw new AppError('Channel not found', 404);
  const member = await prisma.workspaceMember.findUnique({ where: { workspaceId_userId: { workspaceId: channel.workspaceId, userId } } });
  if (!member && channel.workspace.ownerId !== userId && role !== 'admin') throw new AppError('Access denied', 403);
};

const getConversations = async (userId, role) => {
  if (role === "admin") {
    // Admin can see ALL conversations except those they are a participant in and have soft-deleted
    return await prisma.conversation.findMany({
      where: {
        NOT: {
          participants: {
            some: { userId, isDeleted: true },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      include: {
        participants: {
          include: {
            user: {
              select: { userId: true, fullName: true, profileUrl: true },
            },
          },
        },
        _count: { select: { messages: true } },
      },
    });
  } else {
    // Regular user sees only their conversations that are NOT soft-deleted
    return await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId, isDeleted: false },
        },
      },
      orderBy: { updatedAt: "desc" },
      include: {
        participants: {
          include: {
            user: {
              select: { userId: true, fullName: true, profileUrl: true },
            },
          },
        },
        _count: { select: { messages: true } },
      },
    });
  }
};

const getOrCreateConversation = async (userId, targetUserId) => {
  targetUserId = id(targetUserId);
  if (targetUserId === userId) throw new AppError('Cannot chat with yourself', 400);
  const target = await prisma.user.findUnique({ where: { userId: targetUserId } });
  if (!target || !target.isActive) throw new AppError('User not found', 404);
  // Check if 1-on-1 conversation already exists between these two
  const existingConvos = await prisma.conversation.findMany({
    where: {
      isGroup: false,
      AND: [
        { participants: { some: { userId } } },
        { participants: { some: { userId: targetUserId } } },
      ],
    },
    include: {
      participants: {
        include: {
          user: { select: { userId: true, fullName: true, profileUrl: true } },
        },
      },
    },
  });

  if (existingConvos.length > 0) {
    // Restore the conversation (isDeleted: false) for both participants
    await prisma.conversationParticipant.updateMany({
      where: {
        conversationId: existingConvos[0].conversationId,
        userId: { in: [userId, targetUserId] },
      },
      data: { isDeleted: false },
    });
    return existingConvos[0];
  }

  // Create new
  return await prisma.conversation.create({
    data: {
      isGroup: false,
      participants: {
        create: [{ userId }, { userId: targetUserId }],
      },
    },
    include: {
      participants: {
        include: {
          user: { select: { userId: true, fullName: true, profileUrl: true } },
        },
      },
    },
  });
};

const getMessages = async (conversationId, userId, role) => {
  if (!await prisma.conversation.findUnique({ where: { conversationId } })) throw new AppError('Conversation not found', 404);
  // Check auth and retrieve participant info if they are part of it
  let participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: { conversationId, userId },
    },
  }).catch(() => null);

  if (role !== "admin" && !participant) {
    throw new AppError("Not authorized to view this conversation", 403);
  }

  const whereClause = { conversationId, isDeleted: false };
  if (participant && participant.clearedAt) {
    whereClause.createdAt = {
      gt: participant.clearedAt,
    };
  }

  const messages = await prisma.message.findMany({
    where: whereClause,
    orderBy: { createdAt: "asc" },
    include: {
      replyTo: replyInclude,
      sender: {
        select: { userId: true, fullName: true, profileUrl: true },
      },
    },
  });
  return messages.map(message => withReply(message, participant?.clearedAt));
};

const sendMessage = async (conversationId, senderId, content, replyToId = null) => {
  text(content);
  if (!await prisma.conversation.findUnique({ where: { conversationId } })) throw new AppError('Conversation not found', 404);
  // Ensure sender is part of conversation
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: { conversationId, userId: senderId },
    },
  });

  if (!participant) {
    throw new AppError("Not part of this conversation", 403);
  }
  replyToId = await validateReply(prisma.message, replyToId, { conversationId }, participant.clearedAt);

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId,
      content,
      replyToId,
    },
    include: {
      replyTo: replyInclude,
      sender: {
        select: { userId: true, fullName: true, profileUrl: true },
      },
    },
  });

  // Restore the conversation (isDeleted: false) for all participants upon receiving a new message
  await prisma.conversationParticipant.updateMany({
    where: { conversationId },
    data: { isDeleted: false },
  });

  // Update conversation updatedAt
  await prisma.conversation.update({
    where: { conversationId },
    data: { updatedAt: new Date() },
  });

  // Create Notification for other participants
  const otherParticipants = await prisma.conversationParticipant.findMany({
    where: { conversationId, userId: { not: senderId } },
  });

  for (const p of otherParticipants) {
    await prisma.notification.create({
      data: {
        userId: p.userId,
        type: "discussion",
        title: `New Message from ${message.sender.fullName}`,
        message: content.substring(0, 50) + (content.length > 50 ? "..." : ""),
        link: "/chat",
      },
    });
  }

  return { message: withReply(message), otherParticipants };
};

// --- Workspace & Channel Chat Services ---

const getWorkspaces = async (userId, role) => {
  // If admin, maybe return all, but for now let's just return what they are members of + owned
  const workspaces = await prisma.workspace.findMany({
    where:
      role === "admin"
        ? undefined
        : {
            OR: [{ members: { some: { userId } } }, { ownerId: userId }],
          },
    include: {
      channels: true,
    },
  });
  return workspaces;
};

const getChannelMessages = async (channelId, cursor, userId, role) => {
  await authorizeChannel(channelId, userId, role);
  // Cursor based pagination
  const limit = 50;
  const query = {
    take: limit,
    where: { channelId, isDeleted: false },
    orderBy: [{ createdAt: "desc" }, { messageId: "desc" }],
    include: {
      replyTo: replyInclude,
      sender: {
        select: { userId: true, fullName: true, profileUrl: true },
      },
    },
  };

  if (cursor) {
    const anchor = await prisma.channelMessage.findUnique({ where: { messageId: id(cursor) } });
    if (!anchor || anchor.channelId !== channelId) throw new AppError('Invalid channel cursor', 400);
    query.cursor = { messageId: parseInt(cursor) };
    query.skip = 1; // Skip the cursor itself
  }

  const messages = await prisma.channelMessage.findMany(query);
  return messages.reverse().map(message => withReply(message));
};

const sendChannelMessage = async (
  channelId,
  senderId,
  content,
  type = "TEXT",
  metadata = null,
  replyToId = null,
) => {
  text(content);
  await authorizeChannel(channelId, senderId);
  replyToId = await validateReply(prisma.channelMessage, replyToId, { channelId });
  if (!['TEXT', 'CODE', 'ATTACHMENT'].includes(type)) throw new AppError('Invalid message type', 400);
  const message = await prisma.channelMessage.create({
    data: {
      channelId,
      senderId,
      content,
      replyToId,
      type,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
    include: {
      replyTo: replyInclude,
      sender: {
        select: { userId: true, fullName: true, profileUrl: true },
      },
    },
  });
  return withReply(message);
};

const markMessagesAsRead = async (messageIds, conversationId, userId) => {
  await requireParticipant(conversationId, userId);
  if (!Array.isArray(messageIds) || messageIds.length > 500) throw new AppError('Invalid message IDs', 400);
  messageIds = [...new Set(messageIds.map(id))];
  const messages = await prisma.message.findMany({ where: { messageId: { in: messageIds }, conversationId, senderId: { not: userId }, isDeleted: false } });
  if (messages.length !== messageIds.length) throw new AppError('Invalid read receipt messages', 400);
  return await prisma.message.updateMany({
    where: { messageId: { in: messageIds }, conversationId, senderId: { not: userId }, isDeleted: false },
    data: { isRead: true },
  });
};

const createWorkspace = async (name, description, ownerId) => {
  text(name);
  return await prisma.workspace.create({
    data: {
      name,
      description,
      ownerId,
      channels: {
        create: [
          { name: "general", description: "General discussion channel" },
          { name: "announcements", description: "Important announcements" }
        ]
      },
      members: {
        create: {
          userId: ownerId
        }
      }
    },
    include: {
      channels: true,
      members: true
    }
  });
};

const updateWorkspace = async (workspaceId, name, description, userId, role) => {
  const workspace = await prisma.workspace.findUnique({
    where: { workspaceId }
  });
  if (!workspace) throw new AppError("Workspace not found", 404);
  if (workspace.ownerId !== userId && role !== "admin") {
    throw new AppError("You are not authorized to edit this group", 403);
  }

  return await prisma.workspace.update({
    where: { workspaceId },
    data: { name, description },
    include: { channels: true }
  });
};

const addWorkspaceMember = async (workspaceId, userId) => {
  workspaceId = id(workspaceId);
  userId = id(userId);
  const workspace = await prisma.workspace.findUnique({
    where: { workspaceId }
  });
  if (!workspace) throw new AppError("Workspace not found", 404);

  const targetUser = await prisma.user.findUnique({
    where: { userId }
  });
  if (!targetUser || !targetUser.isActive) throw new AppError("User not found", 404);

  const existing = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: { workspaceId, userId }
    }
  });
  if (existing) return existing;

  try {
    return await prisma.workspaceMember.create({ data: { workspaceId, userId } });
  } catch (error) {
    if (error.code !== 'P2002') throw error;
    return prisma.workspaceMember.findUniqueOrThrow({ where: { workspaceId_userId: { workspaceId, userId } } });
  }
};

const deleteConversation = async (conversationId, userId) => {
  await requireParticipant(conversationId, userId);
  return await prisma.conversationParticipant.update({
    where: {
      conversationId_userId: { conversationId: parseInt(conversationId), userId },
    },
    data: {
      isDeleted: true,
    },
  });
};

const clearConversation = async (conversationId, userId) => {
  await requireParticipant(conversationId, userId);
  return await prisma.conversationParticipant.update({
    where: {
      conversationId_userId: { conversationId: parseInt(conversationId), userId },
    },
    data: {
      clearedAt: new Date(),
    },
  });
};

const editMessage = async (messageId, senderId, newContent) => {
  messageId = id(messageId);
  text(newContent);
  const message = await prisma.message.findUnique({ where: { messageId } });
  if (!message) throw new Error("Message not found");
  if (message.senderId !== senderId) throw new Error("Unauthorized to edit this message");
  if (message.isDeleted) throw new AppError('Message deleted', 404);
  await requireParticipant(message.conversationId, senderId);

  const updated = await prisma.message.update({
    where: { messageId },
    data: {
      content: newContent,
      isEdited: true,
    },
    include: {
      replyTo: replyInclude,
      sender: {
        select: { userId: true, fullName: true, profileUrl: true },
      },
    },
  });
  const participant = await prisma.conversationParticipant.findUnique({ where: { conversationId_userId: { conversationId: message.conversationId, userId: senderId } } });
  return withReply(updated, participant?.clearedAt);
};

const deleteMessage = async (messageId, senderId) => {
  messageId = id(messageId);
  const message = await prisma.message.findUnique({ where: { messageId } });
  if (!message) throw new Error("Message not found");
  if (message.senderId !== senderId) throw new Error("Unauthorized to delete this message");
  await requireParticipant(message.conversationId, senderId);

  return await prisma.message.update({
    where: { messageId },
    data: {
      isDeleted: true,
    },
  });
};

const editChannelMessage = async (messageId, senderId, newContent) => {
  messageId = id(messageId);
  text(newContent);
  const message = await prisma.channelMessage.findUnique({ where: { messageId } });
  if (!message) throw new Error("Message not found");
  if (message.senderId !== senderId) throw new Error("Unauthorized to edit this message");
  if (message.isDeleted) throw new AppError('Message deleted', 404);
  await authorizeChannel(message.channelId, senderId);

  const updated = await prisma.channelMessage.update({
    where: { messageId },
    data: {
      content: newContent,
      isEdited: true,
    },
    include: {
      replyTo: replyInclude,
      sender: {
        select: { userId: true, fullName: true, profileUrl: true },
      },
    },
  });
  return withReply(updated);
};

const deleteChannelMessage = async (messageId, senderId) => {
  messageId = id(messageId);
  const message = await prisma.channelMessage.findUnique({ where: { messageId } });
  if (!message) throw new Error("Message not found");
  if (message.senderId !== senderId) throw new Error("Unauthorized to delete this message");
  await authorizeChannel(message.channelId, senderId);

  return await prisma.channelMessage.update({
    where: { messageId },
    data: {
      isDeleted: true,
    },
  });
};

module.exports = {
  replyForRecipient,
  requireParticipant,
  authorizeWorkspaceManager,
  authorizeChannel,
  getOrCreateConversation,
  getConversations,
  getMessages,
  sendMessage,
  getWorkspaces,
  getChannelMessages,
  sendChannelMessage,
  markMessagesAsRead,
  createWorkspace,
  updateWorkspace,
  addWorkspaceMember,
  deleteConversation,
  clearConversation,
  editMessage,
  deleteMessage,
  editChannelMessage,
  deleteChannelMessage,
};
