const catchAsync = require("../../utils/catchAsync");
const authService = require("./auth.service");
const { success, error } = require("../../utils/responseHelper");
const fs = require("fs");
const path = require("path");

const register = catchAsync(async (request, response) => {
  const result = await authService.registerUser(request.body);
  return success(response, result, "Registration successful", 201);
});

const login = catchAsync(async (request, response) => {
  const { email, userId, userName, identifier, password } = request.body;
  const loginId = identifier || email || userId || userName;
  const result = await authService.loginUser(loginId, password);
  return success(response, result, "Login successful");
});

const getProfile = catchAsync(async (request, response) => {
  const user = await authService.getProfile(request.user.userId);
  return success(response, user, "Profile retrieved");
});

const updateProfile = catchAsync(async (request, response) => {
  const user = await authService.updateProfile(
    request.user.userId,
    request.body,
  );
  return success(response, user, "Profile updated");
});

const uploadAvatar = catchAsync(async (request, response) => {
  if (!request.file) {
    return response
      .status(400)
      .json({ success: false, message: "No image file provided" });
  }

  // Construct the relative URL for the static resources middleware
  const profileUrl = `/resources/avatars/${request.file.filename}`;
  const user = await authService.updateProfile(request.user.userId, {
    profileUrl,
  });

  return success(response, user, "Avatar uploaded successfully");
});

const deleteAvatar = catchAsync(async (request, response) => {
  const userProfile = await authService.getProfile(request.user.userId);

  if (userProfile.profileUrl) {
    const filename = path.basename(userProfile.profileUrl);
    const storagePath = process.env.RESOURCE_STORAGE_PATH
      ? path.join(process.env.RESOURCE_STORAGE_PATH, "avatars")
      : path.join(__dirname, "../../resources/avatars");

    const filePath = path.join(storagePath, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    const user = await authService.updateProfile(request.user.userId, {
      profileUrl: null,
    });
    return success(response, user, "Avatar deleted successfully");
  }

  return success(response, userProfile, "No avatar to delete");
});

const changePassword = catchAsync(async (request, response) => {
  const { currentPassword, newPassword } = request.body;
  const result = await authService.changePassword(
    request.user.userId,
    currentPassword,
    newPassword,
  );
  return success(response, result, "Password changed successfully");
});

// Request password reset handler
const requestPasswordReset = catchAsync(async (request, response) => {
  const { email } = request.body;
  const result = await authService.requestPasswordReset(email);
  return success(
    response,
    result,
    "If the email exists, a reset OTP has been sent",
  );
});

// Verify OTP and reset password handler
const verifyPasswordReset = catchAsync(async (request, response) => {
  const { email, otp, newPassword } = request.body;
  const result = await authService.verifyPasswordReset(email, otp, newPassword);
  return success(response, result, "Password has been reset successfully");
});

const requestSignupOtp = catchAsync(async (request, response) => {
  const { email } = request.body;
  const result = await authService.requestSignupOtp(email);
  return success(response, result, "Signup OTP processed");
});

module.exports = {
  requestSignupOtp,
  register,
  login,
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  changePassword,
  requestPasswordReset,
  verifyPasswordReset,
};
