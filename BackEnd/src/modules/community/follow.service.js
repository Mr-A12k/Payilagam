const prisma = require("../../config/prisma");
const networkError = (message, statusCode = 400) => Object.assign(new Error(message), { statusCode });
const validId = value => {
  if (!/^\d+$/.test(String(value)) || !Number.isSafeInteger(Number(value)) || Number(value) < 1 || Number(value) > 2147483647) throw networkError('Invalid user or request ID');
  return Number(value);
};
const activeTarget = async targetId => {
  const user = await prisma.user.findUnique({ where: { userId: targetId } });
  if (!user || !user.isActive) throw networkError('Target user not found', 404);
};

const sendFollowRequest = async (requesterId, targetId) => {
  targetId = validId(targetId);
  await activeTarget(targetId);
  if (requesterId === targetId) {
    throw networkError("You cannot follow yourself");
  }

  // Check if already following
  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: requesterId,
        followingId: targetId,
      },
    },
  });

  if (existingFollow) {
    throw networkError("You are already following this user", 409);
  }

  // Check if a request is already pending
  const existingRequest = await prisma.followRequest.findUnique({
    where: {
      requesterId_targetId: {
        requesterId,
        targetId,
      },
    },
  });

  if (existingRequest) {
    if (existingRequest.status === "pending") {
      throw networkError("Follow request already pending", 409);
    }
    if (existingRequest.status !== "pending") {
      const changed = await prisma.followRequest.updateMany({
        where: { id: existingRequest.id, status: { not: 'pending' } },
        data: { status: "pending" },
      });
      if (!changed.count) throw networkError('Follow request already pending', 409);
      return prisma.followRequest.findUnique({ where: { id: existingRequest.id } });
    }
  }

  // Create new request
  return await prisma.followRequest.create({
    data: {
      requesterId,
      targetId,
      status: "pending",
    },
  });
};

const getPendingRequests = async (userId) => {
  return await prisma.followRequest.findMany({
    where: {
      targetId: userId,
      status: "pending",
      requester: { isActive: true },
    },
    include: {
      requester: {
        select: { userId: true, fullName: true, profileUrl: true, bio: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

const respondToRequest = async (requestId, targetId, status) => {
  requestId = validId(requestId);
  if (!["approved", "rejected"].includes(status)) {
    throw networkError("Invalid status");
  }

  const request = await prisma.followRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw networkError("Follow request not found", 404);
  }

  if (request.targetId !== targetId) {
    throw networkError("Not authorized to respond to this request", 403);
  }

  if (request.status !== 'pending') throw networkError('Request has already been reviewed', 409);
  await activeTarget(request.requesterId);
  return prisma.$transaction(async tx => {
    const changed = await tx.followRequest.updateMany({ where: { id: requestId, status: 'pending' }, data: { status } });
    if (!changed.count) throw networkError('Request has already been reviewed', 409);
    // Approval and its connection are committed together.
    if (status === "approved") {
      await tx.follow.upsert({
        where: { followerId_followingId: { followerId: request.requesterId, followingId: request.targetId } },
        create: { followerId: request.requesterId, followingId: request.targetId },
        update: {},
      });
    }
    return tx.followRequest.findUnique({ where: { id: requestId } });
  });
};

const getFollowers = async (userId) => {
  return await prisma.follow.findMany({
    where: { followingId: userId, follower: { isActive: true } },
    include: {
      follower: {
        select: {
          userId: true,
          fullName: true,
          profileUrl: true,
          bio: true,
          role: { select: { roleName: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

const getFollowing = async (userId) => {
  return await prisma.follow.findMany({
    where: { followerId: userId, following: { isActive: true } },
    include: {
      following: {
        select: { userId: true, fullName: true, profileUrl: true, bio: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

const toggleFollow = async (requesterId, targetId) => {
  targetId = validId(targetId);
  if (requesterId === targetId) {
    throw networkError("You cannot follow yourself");
  }

  const targetUser = await prisma.user.findUnique({
    where: { userId: targetId },
  });

  if (!targetUser || !targetUser.isActive) throw networkError("Target user not found", 404);

  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: requesterId,
        followingId: targetId,
      },
    },
  });

  if (existingFollow) {
    // Unfollow
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: requesterId,
          followingId: targetId,
        },
      },
    });
    return { following: false };
  } else {
    // Follow directly
    await prisma.$transaction([
      prisma.followRequest.updateMany({ where: { requesterId, targetId, status: 'pending' }, data: { status: 'approved' } }),
      prisma.follow.upsert({
        where: { followerId_followingId: { followerId: requesterId, followingId: targetId } },
        create: { followerId: requesterId, followingId: targetId },
        update: {},
      }),
    ]);
    return { following: true };
  }
};

const removeConnection = async (userId, targetId, direction) => {
  targetId = validId(targetId);
  const followerId = direction === 'following' ? userId : targetId;
  const followingId = direction === 'following' ? targetId : userId;
  await prisma.$transaction([
    prisma.follow.deleteMany({ where: { followerId, followingId } }),
    prisma.followRequest.deleteMany({ where: { requesterId: followerId, targetId: followingId } }),
  ]);
  return { removed: true };
};
const getSentRequests = userId => prisma.followRequest.findMany({ where: { requesterId: userId, status: 'pending', target: { isActive: true } }, include: { target: { select: { userId: true, fullName: true, profileUrl: true, bio: true } } }, orderBy: { createdAt: 'desc' } });
const cancelRequest = async (userId, requestId) => {
  requestId = validId(requestId);
  const request = await prisma.followRequest.findUnique({ where: { id: requestId } });
  if (!request) throw networkError('Follow request not found', 404);
  if (request.requesterId !== userId) throw networkError('Not authorized to cancel this request', 403);
  if (request.status !== 'pending') throw networkError('Only pending requests can be cancelled', 409);
  const removed = await prisma.followRequest.deleteMany({ where: { id: requestId, requesterId: userId, status: 'pending' } });
  if (!removed.count) throw networkError('Request has already been reviewed', 409);
  return { cancelled: true };
};

module.exports = {
  sendFollowRequest,
  getPendingRequests,
  respondToRequest,
  getFollowers,
  getFollowing,
  toggleFollow,
  removeConnection,
  getSentRequests,
  cancelRequest,
};
