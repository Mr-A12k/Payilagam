/**
 * @swagger
 * tags:
 *   name: Documents
 *   description: Document management
 */
const express = require("express");
const router = express.Router();
const documentController = require("./document.controller");
const { authenticate, authorize } = require("../../middlewares/authMiddleware");
const documentUpload = require("../../middlewares/documentUploadMiddleware");

// Get all documents (accessible by students and admins)
/**
 * @swagger
 * /:
 *   get:
 *     summary: Get all documents
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of documents
 */
router.get("/", authenticate, documentController.getAllDocuments);

// Upload a new document (Admin only)
/**
 * @swagger
 * /:
 *   post:
 *     summary: Upload a document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Document uploaded
 */
router.post(
  "/",
  authenticate,
  authorize("admin", "mentor"),
  documentUpload.single("file"),
  documentController.uploadDocument,
);

// Delete a document (Admin only)
/**
 * @swagger
 * /{id}:
 *   delete:
 *     summary: Delete a document
 *     tags: [Documents]
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
 *         description: Document deleted
 */
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  documentController.deleteDocument,
);

module.exports = router;
