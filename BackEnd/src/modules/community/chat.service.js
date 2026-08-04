const prisma = require('../../config/prisma');

const getConversations = async (userId, role) => {
    if (role === 'admin') {
        // Admin can see ALL conversations
        return await prisma.conversation.findMany({
            orderBy: { updatedAt: 'desc' },
            include: {
                participants: {
                    include: {
                        user: {
                            select: { userId: true, fullName: true, profileUrl: true }
                        }
                    }
                },
                _count: { select: { messages: true } }
            }
        });
    } else {
        // Regular user sees only their conversations
        return await prisma.conversation.findMany({
            where: {
                participants: {
                    some: { userId }
                }
            },
            orderBy: { updatedAt: 'desc' },
            include: {
                participants: {
                    include: {
                        user: {
                            select: { userId: true, fullName: true, profileUrl: true }
                        }
                    }
                },
                _count: { select: { messages: true } }
            }
        });
    }
};

const getOrCreateConversation = async (userId, targetUserId) => {
    // Check if 1-on-1 conversation already exists between these two
    const existingConvos = await prisma.conversation.findMany({
        where: {
            isGroup: false,
            AND: [
                { participants: { some: { userId } } },
                { participants: { some: { userId: targetUserId } } }
            ]
        },
        include: {
            participants: {
                include: { user: { select: { userId: true, fullName: true, profileUrl: true } } }
            }
        }
    });

    if (existingConvos.length > 0) {
        return existingConvos[0];
    }

    // Create new
    return await prisma.conversation.create({
        data: {
            isGroup: false,
            participants: {
                create: [
                    { userId },
                    { userId: targetUserId }
                ]
            }
        },
        include: {
            participants: {
                include: { user: { select: { userId: true, fullName: true, profileUrl: true } } }
            }
        }
    });
};

const getMessages = async (conversationId, userId, role) => {
    // Check auth
    if (role !== 'admin') {
        const participant = await prisma.conversationParticipant.findUnique({
            where: {
                conversationId_userId: { conversationId, userId }
            }
        });
        if (!participant) {
            throw new Error('Not authorized to view this conversation');
        }
    }

    return await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
        include: {
            sender: {
                select: { userId: true, fullName: true, profileUrl: true }
            }
        }
    });
};

const sendMessage = async (conversationId, senderId, content) => {
    // Ensure sender is part of conversation
    const participant = await prisma.conversationParticipant.findUnique({
        where: {
            conversationId_userId: { conversationId, userId: senderId }
        }
    });

    if (!participant) {
        throw new Error('Not part of this conversation');
    }

    const message = await prisma.message.create({
        data: {
            conversationId,
            senderId,
            content
        },
        include: {
            sender: {
                select: { userId: true, fullName: true, profileUrl: true }
            }
        }
    });

    // Update conversation updatedAt
    await prisma.conversation.update({
        where: { conversationId },
        data: { updatedAt: new Date() }
    });

    // Create Notification for other participants
    const otherParticipants = await prisma.conversationParticipant.findMany({
        where: { conversationId, userId: { not: senderId } }
    });
    
    for (const p of otherParticipants) {
        await prisma.notification.create({
            data: {
                userId: p.userId,
                type: 'discussion',
                title: `New Message from ${message.sender.fullName}`,
                message: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
                link: '/chat'
            }
        });
    }

    return message;
};

// --- Workspace & Channel Chat Services ---

const getWorkspaces = async (userId, role) => {
    // If admin, maybe return all, but for now let's just return what they are members of + owned
    const workspaces = await prisma.workspace.findMany({
        where: role === 'admin' ? undefined : {
            OR: [
                { members: { some: { userId } } },
                { ownerId: userId }
            ]
        },
        include: {
            channels: true
        }
    });
    return workspaces;
};

const getChannelMessages = async (channelId, cursor) => {
    // Cursor based pagination
    const limit = 50;
    const query = {
        take: limit,
        where: { channelId },
        orderBy: { createdAt: 'desc' },
        include: {
            sender: {
                select: { userId: true, fullName: true, profileUrl: true }
            }
        }
    };

    if (cursor) {
        query.cursor = { messageId: parseInt(cursor) };
        query.skip = 1; // Skip the cursor itself
    }

    const messages = await prisma.channelMessage.findMany(query);
    return messages.reverse(); // Return in chronological order
};

const sendChannelMessage = async (channelId, senderId, content, type = 'TEXT', metadata = null) => {
    return await prisma.channelMessage.create({
        data: {
            channelId,
            senderId,
            content,
            type,
            metadata: metadata ? JSON.stringify(metadata) : null
        },
        include: {
            sender: {
                select: { userId: true, fullName: true, profileUrl: true }
            }
        }
    });
};

const markMessagesAsRead = async (messageIds) => {
    return await prisma.message.updateMany({
        where: { messageId: { in: messageIds } },
        data: { isRead: true }
    });
};

module.exports = {
    getOrCreateConversation,
    getConversations,
    getMessages,
    sendMessage,
    getWorkspaces,
    getChannelMessages,
    sendChannelMessage,
    markMessagesAsRead
};
