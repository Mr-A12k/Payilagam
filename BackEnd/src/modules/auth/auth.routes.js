const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');

// Strict rate limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts from this IP, please try again after 15 minutes' }
});

const {
  register,
  login,
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  changePassword,
  requestPasswordReset,
  verifyPasswordReset
} = require('./auth.controller');

const { authenticate } = require('../../middlewares/authMiddleware');
const { validate, validationRules } = require('../../middlewares/validators');

// Avatar Multer Config
const avatarPath = process.env.RESOURCE_STORAGE_PATH 
    ? path.join(process.env.RESOURCE_STORAGE_PATH, 'avatars')
    : path.join(__dirname, '../../resources/avatars');

if (!fs.existsSync(avatarPath)) {
    fs.mkdirSync(avatarPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (request, file, callback) {
        callback(null, avatarPath);
    },
    filename: function (request, file, callback) {
        callback(null, Date.now() + '-avatar' + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Public routes
router.post("/register", validate(validationRules.register), register);
router.post("/login", authLimiter, validate(validationRules.login), login);

// Protected routes
router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);
router.post("/profile/avatar", authenticate, upload.single('avatar'), uploadAvatar);
router.delete("/profile/avatar", authenticate, deleteAvatar);
router.put("/change-password", authenticate, changePassword);
// Password reset routes (public)
router.post("/request-password-reset", authLimiter, validate(validationRules.requestPasswordReset), requestPasswordReset);
router.post("/verify-password-reset", authLimiter, validate(validationRules.verifyPasswordReset), verifyPasswordReset);

module.exports = router;