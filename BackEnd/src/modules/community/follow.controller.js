const followService = require("./follow.service");
const catchAsync = require("../../utils/catchAsync");
const { success } = require("../../utils/responseHelper");

const sendFollowRequest = catchAsync(async (request, response) => {
  const { targetId } = request.body;
  const requesterId = request.user.userId;

  const followRequest = await followService.sendFollowRequest(
    requesterId,
    parseInt(targetId),
  );
  return success(response, followRequest, "Follow request sent successfully");
});

const getPendingRequests = catchAsync(async (request, response) => {
  const userId = request.user.userId;
  const requests = await followService.getPendingRequests(userId);
  return success(response, requests, "Pending requests retrieved successfully");
});

const respondToRequest = catchAsync(async (request, response) => {
  const requestId = parseInt(request.params.id);
  const { status } = request.body; // 'approved' or 'rejected'
  const targetId = request.user.userId;

  const result = await followService.respondToRequest(
    requestId,
    targetId,
    status,
  );
  return success(response, result, `Follow request ${status} successfully`);
});

const getFollowers = catchAsync(async (request, response) => {
  const userId = request.user.userId;
  const followers = await followService.getFollowers(userId);
  return success(response, followers, "Followers retrieved successfully");
});

const getFollowing = catchAsync(async (request, response) => {
  const userId = request.user.userId;
  const following = await followService.getFollowing(userId);
  return success(response, following, "Following retrieved successfully");
});

const toggleFollow = catchAsync(async (request, response) => {
  const { targetId } = request.body;
  const requesterId = request.user.userId;

  const result = await followService.toggleFollow(
    requesterId,
    parseInt(targetId),
  );
  return success(
    response,
    result,
    result.following ? "Followed successfully" : "Unfollowed successfully",
  );
});

module.exports = {
  sendFollowRequest,
  getPendingRequests,
  respondToRequest,
  getFollowers,
  getFollowing,
  toggleFollow,
};
