/**
 * @file socket.js
 * @description Initializes Socket.io server and authentication middleware
 */
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: Token missing"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // Attach user payload to socket
      next();
    } catch (error) {
      return next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id} (User: ${socket.user.userId})`);

    // Global room for personal notifications
    socket.join(`user_${socket.user.userId}`);

    // Load chat event listeners
    require("../modules/community/chat.gateway")(io, socket);

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
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
};
