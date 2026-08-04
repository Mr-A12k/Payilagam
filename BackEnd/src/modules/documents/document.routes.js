const express = require("express");
const router = express.Router();
const documentController = require("./document.controller");
const { authenticate, authorize } = require("../../middlewares/authMiddleware");
const documentUpload = require("../../middlewares/documentUploadMiddleware");

// Get all documents (accessible by students and admins)
router.get("/", authenticate, documentController.getAllDocuments);

// Upload a new document (Admin only)
router.post(
  "/",
  authenticate,
  authorize("admin", "mentor"),
  documentUpload.single("file"),
  documentController.uploadDocument,
);

// Delete a document (Admin only)
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  documentController.deleteDocument,
);

module.exports = router;
