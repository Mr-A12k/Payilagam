const express = require("express");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Follow
 *   description: Follow and follow request endpoints
 */
const { authenticate } = require("../../middlewares/authMiddleware");
const {
  sendFollowRequest,
  getPendingRequests,
  respondToRequest,
  getFollowers,
  getFollowing,
  toggleFollow,
} = require("./follow.controller");

router.use(authenticate);

/**
 * @swagger
 * /follows/request:
 *   post:
 *     summary: Send a follow request
 *     tags: [Follow]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 */
router.post("/request", sendFollowRequest);
/**
 * @swagger
 * /follows/toggle:
 *   post:
 *     summary: Toggle follow status
 *     tags: [Follow]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 */
router.post("/toggle", toggleFollow);
/**
 * @swagger
 * /follows/requests/pending:
 *   get:
 *     summary: Get pending follow requests
 *     tags: [Follow]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/requests/pending", getPendingRequests);
/**
 * @swagger
 * /follows/request/{id}:
 *   put:
 *     summary: Respond to a follow request
 *     tags: [Follow]
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
router.put("/request/:id", respondToRequest);
/**
 * @swagger
 * /follows/followers:
 *   get:
 *     summary: Get followers
 *     tags: [Follow]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/followers", getFollowers);
/**
 * @swagger
 * /follows/following:
 *   get:
 *     summary: Get following
 *     tags: [Follow]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/following", getFollowing);

module.exports = router;
