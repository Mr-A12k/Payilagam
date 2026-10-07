const prisma = require("../../config/prisma");
const AppError = require('../../utils/AppError');

const createNotification = async (userId, data) => {
  const { type, title, message, link } = data;

  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      link: link || null,
    },
  });
};

const createBulkNotifications = async (userIds, data) => {
  const { type, title, message, link } = data;

  const notifications = userIds.map((userId) => ({
    userId,
    type,
    title,
    message,
    link: link || null,
  }));

  return prisma.notification.createMany({
    data: notifications,
  });
};

const getUserNotifications = async (userId, pagination) => {
  const { skip, take } = pagination;

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      skip,
      take,
      orderBy: { createdAt: "desc" },
    }),
    prisma.notification.count({ where: { userId } }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  return { notifications, total, unreadCount };
};

const markAsRead = async (notificationId, userId) => {
  const notification = await prisma.notification.findUnique({
    where: { notificationId: parseInt(notificationId) },
  });

  if (!notification) {
    throw new AppError("Notification not found", 404);
  }

  if (notification.userId !== userId) {
    throw new AppError("Access denied", 403);
  }

  return prisma.notification.update({
    where: { notificationId: parseInt(notificationId) },
    data: { isRead: true },
  });
};

const markAllAsRead = async (userId) => {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });

  return { message: "All notifications marked as read" };
};

const deleteNotification = async (notificationId, userId) => {
  const notification = await prisma.notification.findUnique({
    where: { notificationId: parseInt(notificationId) },
  });

  if (!notification) {
    throw new AppError("Notification not found", 404);
  }

  if (notification.userId !== userId) {
    throw new AppError("Access denied", 403);
  }

  await prisma.notification.delete({
    where: { notificationId: parseInt(notificationId) },
  });

  return { message: "Notification deleted" };
};

const getUnreadCount = async (userId) => {
  const count = await prisma.notification.count({
    where: { userId, isRead: false },
  });

  return { unreadCount: count };
};

const deleteAllNotifications = async (userId) => {
  await prisma.notification.deleteMany({
    where: { userId },
  });
  return { message: "All notifications cleared" };
};

module.exports = {
  createNotification,
  createBulkNotifications,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  deleteAllNotifications,
};
