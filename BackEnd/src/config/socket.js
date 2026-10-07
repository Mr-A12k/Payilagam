/**
 * @file socket.js
 * @description Initializes Socket.io server and authentication middleware with online status tracking
 */
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const prisma = require("./prisma");

let io;
// Map of userId -> Set of socket.id
const onlineUsersMap = new Map();

const getOnlineUserIds = () => {
  return Array.from(onlineUsersMap.keys());
};

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: Token missing"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded?.userId;
      if (!Number.isSafeInteger(userId) || userId <= 0 || userId > 2147483647) {
        return next(new Error("Authentication error: Invalid user ID"));
      }
      const user = await prisma.user.findUnique({
        where: { userId },
        select: { userId: true, isActive: true },
      });
      if (!user || !user.isActive) {
        return next(new Error("Authentication error: Account unavailable"));
      }
      socket.user = { userId: user.userId };
      next();
    } catch (error) {
      return next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = Number(socket.user.userId);
    console.log(`Socket connected: ${socket.id} (User: ${userId})`);

    // Global room for personal notifications
    socket.join(`user_${userId}`);

    // Track online state
    if (!onlineUsersMap.has(userId)) {
      onlineUsersMap.set(userId, new Set());
    }
    onlineUsersMap.get(userId).add(socket.id);

    // Broadcast updated online list to ALL clients
    io.emit("online_users", getOnlineUserIds());

    // Load chat event listeners
    require("../modules/community/chat.gateway")(io, socket);

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id} (User: ${userId})`);
      const userSockets = onlineUsersMap.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsersMap.delete(userId);
        }
      }
      // Broadcast updated online list
      io.emit("online_users", getOnlineUserIds());
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

module.exports = {
  initializeSocket,
  getIo,
  getOnlineUserIds,
};
