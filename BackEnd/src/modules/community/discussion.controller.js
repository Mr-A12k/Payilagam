const catchAsync = require("../../utils/catchAsync");
const discussionService = require("./discussion.service");
const { success, error, paginated } = require("../../utils/responseHelper");
const {
  getPaginationParams,
  getPaginationMeta,
} = require("../../utils/pagination");

// Discussion CRUD
const create = catchAsync(async (request, response) => {
  const discussion = await discussionService.createDiscussion(
    request.user.userId,
    request.body,
  );
  return success(response, discussion, "Discussion created", 201);
});

const getAll = catchAsync(async (request, response) => {
  const pagination = getPaginationParams(request.query);
  const filters = {
    search: request.query.search,
    problemId: request.query.problemId,
    isResolved: request.query.isResolved,
  };
  const { discussions, total } = await discussionService.getAllDiscussions(
    filters,
    pagination,
  );
  const paginationMetadata = getPaginationMeta(
    total,
    pagination.page,
    pagination.limit,
  );
  return paginated(response, discussions, paginationMetadata, "Discussions retrieved");
});

const getById = catchAsync(async (request, response) => {
  const discussion = await discussionService.getDiscussionById(
    request.params.id,
  );
  return success(response, discussion, "Discussion retrieved");
});

const update = catchAsync(async (request, response) => {
  const discussion = await discussionService.updateDiscussion(
    request.params.id,
    request.user.userId,
    request.body,
  );
  return success(response, discussion, "Discussion updated");
});

const remove = catchAsync(async (request, response) => {
  const result = await discussionService.deleteDiscussion(
    request.params.id,
    request.user.userId,
    request.user.role,
  );
  return success(response, result, "Discussion deleted");
});

const toggleResolved = catchAsync(async (request, response) => {
  const discussion = await discussionService.toggleResolved(
    request.params.id,
    request.user.userId,
  );
  return success(response, discussion, "Discussion status toggled");
});

const upvote = catchAsync(async (request, response) => {
  const discussion = await discussionService.upvoteDiscussion(
    request.params.id,
  );
  return success(response, discussion, "Discussion upvoted");
});

// Reply handlers
const createReply = catchAsync(async (request, response) => {
  const reply = await discussionService.createReply(
    request.params.discussionId,
    request.user.userId,
    request.body,
  );
  return success(response, reply, "Reply created", 201);
});

const updateReply = catchAsync(async (request, response) => {
  const reply = await discussionService.updateReply(
    request.params.replyId,
    request.user.userId,
    request.body.content,
  );
  return success(response, reply, "Reply updated");
});

const deleteReply = catchAsync(async (request, response) => {
  const result = await discussionService.deleteReply(
    request.params.replyId,
    request.user.userId,
    request.user.role,
  );
  return success(response, result, "Reply deleted");
});

const upvoteReply = catchAsync(async (request, response) => {
  const reply = await discussionService.upvoteReply(request.params.replyId);
  return success(response, reply, "Reply upvoted");
});

module.exports = {
  create,
  getAll,
  getById,
  update,
  remove,
  toggleResolved,
  upvote,
  createReply,
  updateReply,
  deleteReply,
  upvoteReply,
};
