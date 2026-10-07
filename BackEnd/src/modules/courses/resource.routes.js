/**
 * @swagger
 * tags:
 *   name: Resources
 *   description: Resource management
 */
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const resourceController = require("./resource.controller");
const authMiddleware = require("../../middlewares/authMiddleware");

// Ensure storage directory exists
const storagePath =
  require('../../config/storage').resourceStoragePath;
if (!fs.existsSync(storagePath)) {
  fs.mkdirSync(storagePath, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
  destination: function (request, file, callback) {
    callback(null, storagePath);
  },
  filename: function (request, file, callback) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    callback(null, uniqueSuffix + "-" + file.originalname.replace(/\s+/g, "_"));
  },
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: function (request, file, callback) {
    const fileExt = path.extname(file.originalname).toLowerCase();
    const mimeType = file.mimetype;

    const allowedExtensions = [
      ".pdf",
      ".png",
      ".jpg",
      ".jpeg",
      ".gif",
      ".mp4",
      ".mov",
      ".avi",
      ".mkv",
      ".doc",
      ".docx",
      ".xls",
      ".xlsx",
    ];
    const allowedMimes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/gif",
      "video/mp4",
      "video/quicktime",
      "video/x-msvideo",
      "video/x-matroska",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (
      allowedExtensions.includes(fileExt) &&
      allowedMimes.includes(mimeType)
    ) {
      callback(null, true);
    } else {
      callback(
        Object.assign(new Error(
          "Invalid file type. Only PDFs, Images, Videos, Word, and Excel documents are allowed.",
        ), { statusCode: 400 }),
        false,
      );
    }
  },
});

// Routes
/**
 * @swagger
 * /:
 *   get:
 *     summary: Get all resources
 *     tags: [Resources]
 *     responses:
 *       200:
 *         description: List of resources
 */
router.get("/", resourceController.getAllResources);

/**
 * @swagger
 * /:
 *   post:
 *     summary: Upload a resource
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Resource uploaded
 */
router.post(
  "/",
  authMiddleware.authenticate,
  upload.single("resourceFile"),
  resourceController.uploadResource,
);

/**
 * @swagger
 * /{id}/download:
 *   post:
 *     summary: Download a resource
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resource file
 */
router.post("/:id/download", resourceController.downloadResource);

/**
 * @swagger
 * /{id}:
 *   delete:
 *     summary: Delete a resource
 *     tags: [Resources]
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
 *         description: Resource deleted
 */
router.delete(
  "/:id",
  authMiddleware.authenticate,
  authMiddleware.authorize("admin"),
  resourceController.deleteResource,
);

module.exports = router;
