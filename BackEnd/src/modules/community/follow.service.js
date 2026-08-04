const prisma = require("../../config/prisma");

const sendFollowRequest = async (requesterId, targetId) => {
  if (requesterId === targetId) {
    throw new Error("You cannot follow yourself");
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
    throw new Error("You are already following this user");
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
      throw new Error("Follow request already pending");
    }
    // If it was rejected previously, maybe we allow re-sending or maybe we just update it
    if (existingRequest.status === "rejected") {
      return await prisma.followRequest.update({
        where: { id: existingRequest.id },
        data: { status: "pending" },
      });
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
  if (!["approved", "rejected"].includes(status)) {
    throw new Error("Invalid status");
  }

  const request = await prisma.followRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new Error("Follow request not found");
  }

  if (request.targetId !== targetId) {
    throw new Error("Not authorized to respond to this request");
  }

  // Use a transaction if approved
  if (status === "approved") {
    const [updatedRequest, newFollow] = await prisma.$transaction([
      prisma.followRequest.update({
        where: { id: requestId },
        data: { status: "approved" },
      }),
      prisma.follow.create({
        data: {
          followerId: request.requesterId,
          followingId: request.targetId,
        },
      }),
    ]);
    return updatedRequest;
  } else {
    // If rejected, maybe just update status or delete it
    return await prisma.followRequest.update({
      where: { id: requestId },
      data: { status: "rejected" },
    });
  }
};

const getFollowers = async (userId) => {
  return await prisma.follow.findMany({
    where: { followingId: userId },
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
    where: { followerId: userId },
    include: {
      following: {
        select: { userId: true, fullName: true, profileUrl: true, bio: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

const toggleFollow = async (requesterId, targetId) => {
  if (requesterId === targetId) {
    throw new Error("You cannot follow yourself");
  }

  const targetUser = await prisma.user.findUnique({
    where: { userId: targetId },
  });

  if (!targetUser) throw new Error("Target user not found");

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
    await prisma.follow.create({
      data: {
        followerId: requesterId,
        followingId: targetId,
      },
    });
    return { following: true };
  }
};

module.exports = {
  sendFollowRequest,
  getPendingRequests,
  respondToRequest,
  getFollowers,
  getFollowing,
  toggleFollow,
};
