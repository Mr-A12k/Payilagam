const prisma = require("../../config/prisma");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const generateToken = require("../../utils/generateTokens");

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

const registerUser = async (userData) => {
  const { userName, fullName, email, mobile, password, roleId } = userData;

  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { userName }, { mobile }],
    },
  });

  if (existingUser) {
    if (existingUser.email === email)
      throw new Error("Email already registered");
    if (existingUser.userName === userName)
      throw new Error("Username already taken");
    if (existingUser.mobile === mobile)
      throw new Error("Mobile number already registered");
  }

  // Default to student role (roleId: 3) if not provided
  const assignedRoleId = roleId || 3;

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
    throw new Error("Invalid email or password");
  }

  if (!user.isActive) {
    throw new Error("Account has been deactivated. Contact admin.");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid email or password");
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
      throw new Error("Email is already in use by another account");
    }
  }

  // Validate theme value
  const validThemes = ["dark", "light"];
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
  const user = await prisma.user.findUnique({
    where: { userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new Error("Current password is incorrect");
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
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error("Invalid OTP or email");
  }
  const otpRecord = await prisma.passwordResetOTP.findUnique({
    where: { userId: user.userId },
  });
  if (!otpRecord) {
    throw new Error("Invalid OTP or email");
  }
  if (otpRecord.expiresAt < new Date()) {
    throw new Error("OTP has expired");
  }
  const isValid = await bcrypt.compare(otp, otpRecord.otpHash);
  if (!isValid) {
    throw new Error("Invalid OTP");
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
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  changePassword,
  requestPasswordReset,
  verifyPasswordReset,
};
