const express = require("express");
const router = express.Router();

const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  remove,
  getUnreadCount,
} = require("./notification.controller");

const { authenticate } = require("../../middlewares/authMiddleware");

// All notification routes require authentication
router.use(authenticate);

router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);
router.put("/read-all", markAllAsRead);
router.put("/:id/read", markAsRead);
router.delete("/:id", remove);

module.exports = router;
