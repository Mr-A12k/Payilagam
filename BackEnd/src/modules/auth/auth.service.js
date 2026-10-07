const prisma = require("../../config/prisma");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const generateToken = require("../../utils/generateTokens");
const authError = (message, statusCode = 400) => Object.assign(new Error(message), { statusCode });

const getPageAccess = (roleName) => {
  switch (roleName) {
    case "admin":
      return ["PG_ADM", "PG_USR", "PG_ANA", "PG_STG"];
    case "mentor":
      return ["PG_MNT", "PG_BLD", "PG_STU", "PG_ANA", "PG_STG"];
    case "student":
    default:
      return ["PG_DSH", "PG_LRN", "PG_PRC", "PG_ASN", "PG_STG", "PG_CAT"];
  }
};

// In-memory OTP store for signups: Map<email, { otp: string, expiresAt: number }>
const signupOtpCache = new Map();

const requestSignupOtp = async (email) => {
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) throw authError('Invalid email address');
  email = email.trim().toLowerCase();
  // Check if email already registered
  const existingUser = await prisma.user.findFirst({
    where: { email },
  });
  if (existingUser) {
    throw authError("Email already registered", 409);
  }

  const otp = crypto.randomInt(100000, 1000000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000;
  await require('../../utils/email').sendMail(email, 'Your Payilagam verification code', `Your verification code is ${otp}. It expires in five minutes.`);
  signupOtpCache.set(email, { otp, expiresAt, attempts: 0 });

  return { success: true, message: "OTP sent successfully. Please check your email." };
};

const registerUser = async (userData) => {
  if (typeof userData.email === 'string') userData.email = userData.email.trim().toLowerCase();
  const studentRole = await prisma.role.findUnique({ where: { roleName: 'student' } });
  if (!studentRole) throw authError('Student role is not configured', 503);
  if (userData.roleId !== undefined && Number(userData.roleId) !== studentRole.roleId) throw authError('Public registration is only available for student accounts', 403);
  for (const field of ['userName', 'fullName', 'mobile']) {
    if (typeof userData[field] !== 'string' || !userData[field].trim()) throw authError(`${field} is required`);
    userData[field] = userData[field].trim();
  }
  const { userName, fullName, email, mobile, password, roleId, otp } = userData;

  // Validate OTP
  const cachedData = signupOtpCache.get(email);
  if (!cachedData) {
    throw authError("OTP not requested or expired");
  }
  
  if (Date.now() > cachedData.expiresAt) {
    signupOtpCache.delete(email);
    throw authError("OTP has expired. Please request a new one.");
  }
  
  if (cachedData.otp !== otp) {
    cachedData.attempts++;
    if (cachedData.attempts >= 5) signupOtpCache.delete(email);
    throw authError("Invalid OTP provided");
  }
  
  // Clean up cache on success

  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { userName }, { mobile }],
    },
  });

  if (existingUser) {
    if (existingUser.email === email)
      throw authError("Email already registered", 409);
    if (existingUser.userName === userName)
      throw authError("Username already taken", 409);
    if (existingUser.mobile === mobile)
      throw authError("Mobile number already registered", 409);
  }

  // Default to student role (roleId: 3) if not provided
  const assignedRoleId = studentRole.roleId;

  // Verify role exists
  const role = await prisma.role.findUnique({
    where: { roleId: assignedRoleId },
  });

  if (!role) {
    throw new Error("Invalid role");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      userName,
      fullName,
      email,
      mobile,
      password: hashedPassword,
      roleId: assignedRoleId,
    },
    include: {
      role: true,
    },
  });

  const token = generateToken(user.userId, user.role.roleName);
  signupOtpCache.delete(email);

  return {
    token,
    user: {
      userId: user.userId,
      id: user.userId,
      userName: user.userName,
      fullName: user.fullName,
      email: user.email,
      role: user.role.roleName,
      roleId: user.roleId,
      theme: user.theme || "dark",
      pageAccess: getPageAccess(user.role.roleName),
    },
  };
};

const loginUser = async (identifier, password) => {
  if (!identifier) {
    throw new Error("Please provide an email, username, or user ID");
  }

  const whereClause = {
    OR: [{ email: identifier }, { userName: identifier }],
  };

  // If identifier is purely numeric, allow matching by userId
  if (/^\d+$/.test(identifier)) {
    whereClause.OR.push({ userId: parseInt(identifier, 10) });
  }

  const user = await prisma.user.findFirst({
    where: whereClause,
    include: {
      role: true,
    },
  });

  if (!user) {
    throw authError("Invalid email or password", 401);
  }

  if (!user.isActive) {
    throw Object.assign(new Error("Account has been deactivated. Contact admin."), { statusCode: 403 });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw authError("Invalid email or password", 401);
  }

  const token = generateToken(user.userId, user.role.roleName);

  // Update last login
  await prisma.user.update({
    where: { userId: user.userId },
    data: { lastLoginAt: new Date() },
  });

  const userPayload = {
    userId: user.userId,
    id: user.userId,
    userName: user.userName,
    fullName: user.fullName,
    email: user.email,
    role: user.role.roleName,
    roleId: user.roleId,
    profileUrl: user.profileUrl,
    theme: user.theme || "dark",
    pageAccess: getPageAccess(user.role.roleName),
  };

  if (user.mustChangePassword) {
    return {
      requiresPasswordChange: true,
      token,
      user: userPayload,
    };
  }

  return {
    token,
    user: userPayload,
  };
};

const getProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { userId },
    include: {
      role: true,
      enrollments: {
        include: {
          course: {
            select: {
              courseId: true,
              courseName: true,
              courseCode: true,
              thumbnail: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const { password, ...userWithoutPassword } = user;
  return {
    ...userWithoutPassword,
    theme: user.theme || "dark",
    pageAccess: getPageAccess(user.role.roleName),
  };
};

const updateProfile = async (userId, updateData) => {
  if (updateData.fullName !== undefined && (typeof updateData.fullName !== 'string' || !updateData.fullName.trim())) throw authError('Full name is required');
  if (updateData.email !== undefined) {
    if (typeof updateData.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updateData.email.trim())) throw authError('Invalid email address');
    updateData.email = updateData.email.trim().toLowerCase();
  }
  const {
    fullName,
    bio,
    skills,
    experience,
    socialLinks,
    profileUrl,
    email,
    theme,
  } = updateData;

  if (email) {
    const existingEmail = await prisma.user.findFirst({
      where: { email, userId: { not: userId } },
    });
    if (existingEmail) {
      throw authError("Email is already in use by another account", 409);
    }
  }

  // Validate theme value
  const validThemes = ["dark", "light", "ocean", "rose", "graphite", "forest", "ember"];
  const resolvedTheme =
    theme && validThemes.includes(theme) ? theme : undefined;

  const user = await prisma.user.update({
    where: { userId },
    data: {
      ...(fullName && { fullName }),
      ...(email && { email }),
      ...(bio !== undefined && { bio }),
      ...(experience !== undefined && { experience }),
      ...(skills !== undefined && {
        skills: typeof skills === "string" ? skills : JSON.stringify(skills),
      }),
      ...(socialLinks !== undefined && {
        socialLinks:
          typeof socialLinks === "string"
            ? socialLinks
            : JSON.stringify(socialLinks),
      }),
      ...(profileUrl !== undefined && { profileUrl }),
      ...(resolvedTheme !== undefined && { theme: resolvedTheme }),
    },
    include: { role: true },
  });

  const { password, ...userWithoutPassword } = user;
  return {
    ...userWithoutPassword,
    theme: user.theme || "dark",
    pageAccess: getPageAccess(user.role.roleName),
  };
};

const changePassword = async (userId, currentPassword, newPassword) => {
  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string' || newPassword.length < 8) throw authError('Current password and a new password of at least 8 characters are required');
  const user = await prisma.user.findUnique({
    where: { userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw authError("Current password is incorrect");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { userId },
    data: {
      password: hashedPassword,
      mustChangePassword: false,
    },
  });

  return { message: "Password changed successfully" };
};

// Request password reset: generate OTP, store hashed, send email (dummy)
const requestPasswordReset = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // For security, do not reveal that email is missing
    return { message: "If the email exists, a reset OTP has been sent" };
  }
  // Generate 6-digit OTP securely
  const otp = crypto.randomInt(100000, 1000000).toString();
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  // Upsert OTP record
  await prisma.passwordResetOTP.upsert({
    where: { userId: user.userId },
    update: { otpHash, expiresAt },
    create: { userId: user.userId, otpHash, expiresAt },
  });
  // Send email via dummy utility
  const emailUtil = require("../../utils/email");
  const subject = "Your TaskPro Password Reset OTP";
  const body = `Your OTP code is ${otp}. It will expire in 15 minutes.`;
  await emailUtil.sendMail(email, subject, body);
  return { message: "If the email exists, a reset OTP has been sent" };
};

// Verify OTP and reset password
const verifyPasswordReset = async (email, otp, newPassword) => {
  if (typeof email !== 'string' || typeof otp !== 'string' || typeof newPassword !== 'string' || newPassword.length < 8) throw authError('Email, OTP, and a password of at least 8 characters are required');
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw authError("Invalid OTP or email");
  }
  const otpRecord = await prisma.passwordResetOTP.findUnique({
    where: { userId: user.userId },
  });
  if (!otpRecord) {
    throw authError("Invalid OTP or email");
  }
  if (otpRecord.expiresAt < new Date()) {
    throw authError("OTP has expired");
  }
  const isValid = await bcrypt.compare(otp, otpRecord.otpHash);
  if (!isValid) {
    throw authError("Invalid OTP");
  }
  // Update password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { userId: user.userId },
    data: { password: hashedPassword, mustChangePassword: false },
  });
  // Delete OTP record
  await prisma.passwordResetOTP.delete({ where: { userId: user.userId } });
  return { message: "Password has been reset successfully" };
};

module.exports = {
  requestSignupOtp,
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  changePassword,
  requestPasswordReset,
  verifyPasswordReset,
};
