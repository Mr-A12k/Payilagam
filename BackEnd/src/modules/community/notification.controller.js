const catchAsync = require("../../utils/catchAsync");
const notificationService = require("./notification.service");
const { success, error, paginated } = require("../../utils/responseHelper");
const {
  getPaginationParams,
  getPaginationMeta,
} = require("../../utils/pagination");

const getNotifications = catchAsync(async (request, response) => {
  const pagination = getPaginationParams(request.query);
  const { notifications, total, unreadCount } =
    await notificationService.getUserNotifications(
      request.user.userId,
      pagination,
    );
  const paginationMetadata = getPaginationMeta(
    total,
    pagination.page,
    pagination.limit,
  );
  return response.status(200).json({
    success: true,
    message: "Notifications retrieved",
    data: notifications,
    pagination: paginationMetadata,
    unreadCount,
  });
});

const markAsRead = catchAsync(async (request, response) => {
  const notification = await notificationService.markAsRead(
    request.params.id,
    request.user.userId,
  );
  return success(response, notification, "Notification marked as read");
});

const markAllAsRead = catchAsync(async (request, response) => {
  const result = await notificationService.markAllAsRead(request.user.userId);
  return success(response, result, "All notifications marked as read");
});

const remove = catchAsync(async (request, response) => {
  const result = await notificationService.deleteNotification(
    request.params.id,
    request.user.userId,
  );
  return success(response, result, "Notification deleted");
});

const getUnreadCount = catchAsync(async (request, response) => {
  const result = await notificationService.getUnreadCount(request.user.userId);
  return success(response, result, "Unread count retrieved");
});

const clearAll = catchAsync(async (request, response) => {
  const result = await notificationService.deleteAllNotifications(request.user.userId);
  return success(response, result, "All notifications cleared successfully");
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  remove,
  getUnreadCount,
  clearAll,
};
