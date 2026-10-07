const express = require("express");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Notification
 *   description: Notification endpoints
 */

const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  remove,
  getUnreadCount,
  clearAll,
} = require("./notification.controller");

const { authenticate } = require("../../middlewares/authMiddleware");

// All notification routes require authentication
router.use(authenticate);
router.param('id', (req, res, next, value) => { try { require('./validation').id(value); next(); } catch (error) { next(error); } });

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get notifications
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/", getNotifications);
/**
 * @swagger
 * /notifications/unread-count:
 *   get:
 *     summary: Get unread notification count
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/unread-count", getUnreadCount);
/**
 * @swagger
 * /notifications/read-all:
 *   put:
 *     summary: Mark all notifications as read
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 */
router.put("/read-all", markAllAsRead);
/**
 * @swagger
 * /notifications/{id}/read:
 *   put:
 *     summary: Mark a notification as read
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.put("/:id/read", markAsRead);
/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.delete("/clear-all", clearAll);
router.delete("/:id", remove);

module.exports = router;
