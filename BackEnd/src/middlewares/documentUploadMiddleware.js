const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../../uploads/documents");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (request, file, callback) {
    callback(null, uploadDir);
  },
  filename: function (request, file, callback) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    callback(null, "doc-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (request, file, callback) => {
  if (
    file.mimetype === "application/pdf" &&
    path.extname(file.originalname).toLowerCase() === '.pdf'
  ) {
    callback(null, true);
  } else {
    callback(Object.assign(new Error("Not a PDF! Please upload a PDF document."), { statusCode: 400 }), false);
  }
};

const documentUpload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB limit for documents
    files: 1,
    fields: 3,
  },
  fileFilter: fileFilter,
});

module.exports = documentUpload;
