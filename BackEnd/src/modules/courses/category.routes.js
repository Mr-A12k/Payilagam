/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category management
 */
const express = require("express");
const router = express.Router();

const {
  create,
  getAll,
  getById,
  update,
  remove,
} = require("./category.controller");

const { authenticate, authorize } = require("../../middlewares/authMiddleware");

// Public routes
/**
 * @swagger
 * /:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get("/", getAll);

/**
 * @swagger
 * /{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category details
 */
router.get("/:id", getById);

// Admin only routes
/**
 * @swagger
 * /:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Category created
 */
router.post("/", authenticate, authorize("admin"), create);

/**
 * @swagger
 * /{id}:
 *   put:
 *     summary: Update a category
 *     tags: [Categories]
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
 *         description: Category updated
 */
router.put("/:id", authenticate, authorize("admin"), update);

/**
 * @swagger
 * /{id}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Categories]
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
 *         description: Category deleted
 */
router.delete("/:id", authenticate, authorize("admin"), remove);

module.exports = router;
