const express = require("express");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Discussion
 *   description: Discussion and reply endpoints
 */

const {
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
} = require("./discussion.controller");

const { authenticate } = require("../../middlewares/authMiddleware");
const { validate, validationRules } = require("../../middlewares/validators");
router.use(authenticate, require('./validation').validateIds);
for (const parameter of ['id', 'discussionId', 'replyId']) {
  router.param(parameter, (req, res, next, value) => { try { require('./validation').id(value); next(); } catch (error) { next(error); } });
}

// Discussion routes
/**
 * @swagger
 * /discussions:
 *   get:
 *     summary: Get all discussions
 *     tags: [Discussion]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/", authenticate, getAll);
/**
 * @swagger
 * /discussions/{id}:
 *   get:
 *     summary: Get discussion by ID
 *     tags: [Discussion]
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
router.get("/:id", authenticate, getById);
/**
 * @swagger
 * /discussions:
 *   post:
 *     summary: Create a discussion
 *     tags: [Discussion]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Created
 */
router.post(
  "/",
  authenticate,
  validate(validationRules.createDiscussion),
  create,
);
/**
 * @swagger
 * /discussions/{id}:
 *   put:
 *     summary: Update a discussion
 *     tags: [Discussion]
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
router.put("/:id", authenticate, update);
/**
 * @swagger
 * /discussions/{id}:
 *   delete:
 *     summary: Delete a discussion
 *     tags: [Discussion]
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
router.delete("/:id", authenticate, remove);
/**
 * @swagger
 * /discussions/{id}/resolve:
 *   put:
 *     summary: Toggle discussion resolved status
 *     tags: [Discussion]
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
router.put("/:id/resolve", authenticate, toggleResolved);
/**
 * @swagger
 * /discussions/{id}/upvote:
 *   post:
 *     summary: Upvote a discussion
 *     tags: [Discussion]
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
router.post("/:id/upvote", authenticate, upvote);

// Reply routes
/**
 * @swagger
 * /discussions/{discussionId}/replies:
 *   post:
 *     summary: Create a reply
 *     tags: [Discussion]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: discussionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Created
 */
router.post("/:discussionId/replies", authenticate, createReply);
/**
 * @swagger
 * /discussions/replies/{replyId}:
 *   put:
 *     summary: Update a reply
 *     tags: [Discussion]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: replyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.put("/replies/:replyId", authenticate, updateReply);
/**
 * @swagger
 * /discussions/replies/{replyId}:
 *   delete:
 *     summary: Delete a reply
 *     tags: [Discussion]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: replyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.delete("/replies/:replyId", authenticate, deleteReply);
/**
 * @swagger
 * /discussions/replies/{replyId}/upvote:
 *   post:
 *     summary: Upvote a reply
 *     tags: [Discussion]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: replyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.post("/replies/:replyId/upvote", authenticate, upvoteReply);

module.exports = router;
