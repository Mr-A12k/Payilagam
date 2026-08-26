const prisma = require("../../config/prisma");

const createDiscussion = async (authorId, data) => {
  const { title, content, problemId } = data;

  // If problemId provided, verify it exists
  if (problemId) {
    const problem = await prisma.codingProblem.findUnique({
      where: { problemId: parseInt(problemId) },
    });
    if (!problem) {
      throw new Error("Coding problem not found");
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
    throw new Error("Discussion not found");
  }

  return discussion;
};

const updateDiscussion = async (discussionId, authorId, data) => {
  const discussion = await prisma.discussion.findUnique({
    where: { discussionId: parseInt(discussionId) },
  });

  if (!discussion) {
    throw new Error("Discussion not found");
  }

  if (discussion.authorId !== authorId) {
    throw new Error("You can only edit your own discussions");
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
    throw new Error("Discussion not found");
  }

  if (discussion.authorId !== userId && userRole !== "admin") {
    throw new Error("You can only delete your own discussions");
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
    throw new Error("Discussion not found");
  }

  if (discussion.authorId !== userId) {
    throw new Error("Only the author can mark discussions as resolved");
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
    throw new Error("Discussion not found");
  }

  return prisma.discussion.update({
    where: { discussionId: parseInt(discussionId) },
    data: { upvotes: { increment: 1 } },
  });
};

// Reply functions
const createReply = async (discussionId, authorId, data) => {
  const { content, parentReplyId } = data;

  const discussion = await prisma.discussion.findUnique({
    where: { discussionId: parseInt(discussionId) },
  });

  if (!discussion) {
    throw new Error("Discussion not found");
  }

  if (parentReplyId) {
    const parentReply = await prisma.discussionReply.findUnique({
      where: { replyId: parseInt(parentReplyId) },
    });
    if (!parentReply || parentReply.discussionId !== parseInt(discussionId)) {
      throw new Error("Parent reply not found in this discussion");
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
  const reply = await prisma.discussionReply.findUnique({
    where: { replyId: parseInt(replyId) },
  });

  if (!reply) {
    throw new Error("Reply not found");
  }

  if (reply.authorId !== authorId) {
    throw new Error("You can only edit your own replies");
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
    throw new Error("Reply not found");
  }

  if (reply.authorId !== userId && userRole !== "admin") {
    throw new Error("You can only delete your own replies");
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
    throw new Error("Reply not found");
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
