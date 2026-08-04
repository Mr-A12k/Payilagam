const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const resourceController = require("./resource.controller");
const authMiddleware = require("../../middlewares/authMiddleware");

// Ensure storage directory exists
const storagePath =
  process.env.RESOURCE_STORAGE_PATH || path.join(__dirname, "../../resources");
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
        new Error(
          "Invalid file type. Only PDFs, Images, Videos, Word, and Excel documents are allowed.",
        ),
        false,
      );
    }
  },
});

// Routes
router.get("/", resourceController.getAllResources);
router.post(
  "/",
  authMiddleware.authenticate,
  upload.single("resourceFile"),
  resourceController.uploadResource,
);
router.post("/:id/download", resourceController.downloadResource);
router.delete(
  "/:id",
  authMiddleware.authenticate,
  authMiddleware.authorize("admin"),
  resourceController.deleteResource,
);

module.exports = router;
