const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const rateLimit = require("express-rate-limit");

// Strict rate limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many authentication attempts from this IP, please try again after 15 minutes",
  },
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
  verifyPasswordReset,
  requestSignupOtp,
} = require("./auth.controller");

const { authenticate } = require("../../middlewares/authMiddleware");
const { validate, validationRules } = require("../../middlewares/validators");

// Avatar Multer Config
const avatarPath = path.join(require('../../config/storage').resourceStoragePath, "avatars");

if (!fs.existsSync(avatarPath)) {
  fs.mkdirSync(avatarPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (request, file, callback) {
    callback(null, avatarPath);
  },
  filename: function (request, file, callback) {
    callback(null, Date.now() + "-avatar" + path.extname(file.originalname));
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, file, callback) => {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.mimetype)) return callback(Object.assign(new Error('Upload a PNG, JPEG, or WebP image'), { statusCode: 400 }));
  callback(null, true);
} });

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication API
 */

/**
 * @swagger
 * /api/auth/request-signup-otp:
 *   post:
 *     summary: Request an OTP for signup
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP requested
 */
router.post("/request-signup-otp", authLimiter, requestSignupOtp);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               fullName:
 *                 type: string
 *               userName:
 *                 type: string
 *               mobile:
 *                 type: string
 *     responses:
 *       200:
 *         description: User registered successfully
 */
router.post("/register", validate(validationRules.register), register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully logged in
 *       401:
 *         description: Unauthorized
 */
router.post("/login", authLimiter, validate(validationRules.login), login);

// Protected routes
/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns user profile
 */
router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);
router.post(
  "/profile/avatar",
  authenticate,
  upload.single("avatar"),
  uploadAvatar,
);
router.delete("/profile/avatar", authenticate, deleteAvatar);
router.put("/change-password", authenticate, changePassword);
// Password reset routes (public)
router.post(
  "/request-password-reset",
  authLimiter,
  validate(validationRules.requestPasswordReset),
  requestPasswordReset,
);
router.post(
  "/verify-password-reset",
  authLimiter,
  validate(validationRules.verifyPasswordReset),
  verifyPasswordReset,
);

module.exports = router;
