const prisma = require("../../config/prisma");
const AppError = require('../../utils/AppError');
const { text } = require('./validation');

const createDiscussion = async (authorId, data) => {
  const { title, content, problemId } = data;

  // If problemId provided, verify it exists
  if (problemId) {
    const problem = await prisma.codingProblem.findUnique({
      where: { problemId: parseInt(problemId) },
    });
    if (!problem) {
      throw new AppError("Coding problem not found", 404);
    }
  }

  const discussion = await prisma.discussion.create({
    data: {
      title,
      content,
      authorId,
      problemId: problemId ? parseInt(problemId) : null,
    },
    include: {
      author: {
        select: {
          userId: true,
          userName: true,
          fullName: true,
          profileUrl: true,
        },
      },
      problem: {
        select: {
          problemId: true,
          title: true,
          slug: true,
        },
      },
    },
  });

  return discussion;
};

const getAllDiscussions = async (filters, pagination) => {
  const { search, problemId, isResolved } = filters;
  const { skip, take } = pagination;

  const where = {};

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { content: { contains: search, mode: "insensitive" } },
    ];
  }

  if (problemId) {
    where.problemId = parseInt(problemId);
  }

  if (isResolved !== undefined) {
    where.isResolved = isResolved === "true" || isResolved === true;
  }

  const [discussions, total] = await Promise.all([
    prisma.discussion.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            userId: true,
            userName: true,
            fullName: true,
            profileUrl: true,
          },
        },
        problem: {
          select: {
            problemId: true,
            title: true,
            slug: true,
          },
        },
        _count: {
          select: { replies: true },
        },
      },
    }),
    prisma.discussion.count({ where }),
  ]);

  return { discussions, total };
};

const getDiscussionById = async (discussionId) => {
  const discussion = await prisma.discussion.findUnique({
    where: { discussionId: parseInt(discussionId) },
    include: {
      author: {
        select: {
          userId: true,
          userName: true,
          fullName: true,
          profileUrl: true,
        },
      },
      problem: {
        select: {
          problemId: true,
          title: true,
          slug: true,
        },
      },
      replies: {
        where: { parentReplyId: null }, // top-level replies only
        orderBy: { createdAt: "asc" },
        include: {
          author: {
            select: {
              userId: true,
              userName: true,
              fullName: true,
              profileUrl: true,
            },
          },
          childReplies: {
            orderBy: { createdAt: "asc" },
            include: {
              author: {
                select: {
                  userId: true,
                  userName: true,
                  fullName: true,
                  profileUrl: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!discussion) {
    throw new AppError("Discussion not found", 404);
  }

  return discussion;
};

const updateDiscussion = async (discussionId, authorId, data) => {
  const discussion = await prisma.discussion.findUnique({
    where: { discussionId: parseInt(discussionId) },
  });

  if (!discussion) {
    throw new AppError("Discussion not found", 404);
  }

  if (discussion.authorId !== authorId) {
    throw new AppError("You can only edit your own discussions", 403);
  }

  return prisma.discussion.update({
    where: { discussionId: parseInt(discussionId) },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.content && { content: data.content }),
    },
    include: {
      author: {
        select: {
          userId: true,
          userName: true,
          fullName: true,
          profileUrl: true,
        },
      },
    },
  });
};

const deleteDiscussion = async (discussionId, userId, userRole) => {
  const discussion = await prisma.discussion.findUnique({
    where: { discussionId: parseInt(discussionId) },
  });

  if (!discussion) {
    throw new AppError("Discussion not found", 404);
  }

  if (discussion.authorId !== userId && userRole !== "admin") {
    throw new AppError("You can only delete your own discussions", 403);
  }

  await prisma.discussion.delete({
    where: { discussionId: parseInt(discussionId) },
  });

  return { message: "Discussion deleted successfully" };
};

const toggleResolved = async (discussionId, userId) => {
  const discussion = await prisma.discussion.findUnique({
    where: { discussionId: parseInt(discussionId) },
  });

  if (!discussion) {
    throw new AppError("Discussion not found", 404);
  }

  if (discussion.authorId !== userId) {
    throw new AppError("Only the author can mark discussions as resolved", 403);
  }

  return prisma.discussion.update({
    where: { discussionId: parseInt(discussionId) },
    data: { isResolved: !discussion.isResolved },
  });
};

const upvoteDiscussion = async (discussionId) => {
  const discussion = await prisma.discussion.findUnique({
    where: { discussionId: parseInt(discussionId) },
  });

  if (!discussion) {
    throw new AppError("Discussion not found", 404);
  }

  return prisma.discussion.update({
    where: { discussionId: parseInt(discussionId) },
    data: { upvotes: { increment: 1 } },
  });
};

// Reply functions
const createReply = async (discussionId, authorId, data) => {
  const { content, parentReplyId } = data;
  text(content);

  const discussion = await prisma.discussion.findUnique({
    where: { discussionId: parseInt(discussionId) },
  });

  if (!discussion) {
    throw new AppError("Discussion not found", 404);
  }

  if (parentReplyId) {
    const parentReply = await prisma.discussionReply.findUnique({
      where: { replyId: parseInt(parentReplyId) },
    });
    if (!parentReply || parentReply.discussionId !== parseInt(discussionId)) {
      throw new AppError("Parent reply not found in this discussion", 400);
    }
  }

  return prisma.discussionReply.create({
    data: {
      discussionId: parseInt(discussionId),
      authorId,
      content,
      parentReplyId: parentReplyId ? parseInt(parentReplyId) : null,
    },
    include: {
      author: {
        select: {
          userId: true,
          userName: true,
          fullName: true,
          profileUrl: true,
        },
      },
    },
  });
};

const updateReply = async (replyId, authorId, content) => {
  text(content);
  const reply = await prisma.discussionReply.findUnique({
    where: { replyId: parseInt(replyId) },
  });

  if (!reply) {
    throw new AppError("Reply not found", 404);
  }

  if (reply.authorId !== authorId) {
    throw new AppError("You can only edit your own replies", 403);
  }

  return prisma.discussionReply.update({
    where: { replyId: parseInt(replyId) },
    data: { content },
    include: {
      author: {
        select: {
          userId: true,
          userName: true,
          fullName: true,
          profileUrl: true,
        },
      },
    },
  });
};

const deleteReply = async (replyId, userId, userRole) => {
  const reply = await prisma.discussionReply.findUnique({
    where: { replyId: parseInt(replyId) },
  });

  if (!reply) {
    throw new AppError("Reply not found", 404);
  }

  if (reply.authorId !== userId && userRole !== "admin") {
    throw new AppError("You can only delete your own replies", 403);
  }

  await prisma.discussionReply.delete({
    where: { replyId: parseInt(replyId) },
  });

  return { message: "Reply deleted successfully" };
};

const upvoteReply = async (replyId) => {
  const reply = await prisma.discussionReply.findUnique({
    where: { replyId: parseInt(replyId) },
  });

  if (!reply) {
    throw new AppError("Reply not found", 404);
  }

  return prisma.discussionReply.update({
    where: { replyId: parseInt(replyId) },
    data: { upvotes: { increment: 1 } },
  });
};

module.exports = {
  createDiscussion,
  getAllDiscussions,
  getDiscussionById,
  updateDiscussion,
  deleteDiscussion,
  toggleResolved,
  upvoteDiscussion,
  createReply,
  updateReply,
  deleteReply,
  upvoteReply,
};
