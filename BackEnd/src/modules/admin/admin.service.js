const prisma = require("../../config/prisma");
const bcrypt = require("bcryptjs");
const os = require("os");

const userError = (message, statusCode = 400) => Object.assign(new Error(message), { statusCode });
const userIdValue = value => {
  if (!/^\d+$/.test(String(value)) || Number(value) < 1) throw userError('Invalid user ID');
  return Number(value);
};
const validateUserData = async (data, creating = false, userId) => {
  for (const field of ['fullName', 'email', 'mobile', ...(creating ? ['userName'] : [])]) {
    if (creating || data[field] !== undefined) {
      if (typeof data[field] !== 'string' || !data[field].trim()) throw userError(`${field} is required`);
      data[field] = data[field].trim();
    }
  }
  if (data.email !== undefined) {
    data.email = data.email.toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) throw userError('Invalid email address');
  }
  if (data.isActive !== undefined && typeof data.isActive !== 'boolean') throw userError('isActive must be a boolean');
  if (data.password !== undefined && (typeof data.password !== 'string' || data.password.length < 6)) throw userError('Password must be at least 6 characters');
  if (data.roleId !== undefined) {
    data.roleId = Number(data.roleId);
    if (!Number.isInteger(data.roleId) || !await prisma.role.findUnique({ where: { roleId: data.roleId } })) throw userError('Invalid role');
  }
  const identities = ['email', 'mobile', 'userName'].filter(field => data[field] !== undefined).map(field => ({ [field]: data[field] }));
  if (identities.length && await prisma.user.findFirst({ where: { OR: identities, ...(userId ? { userId: { not: userId } } : {}) } })) throw userError('Email, username, or mobile already registered', 409);
};

// ─────────────────────────────────────────────────────────────
// DASHBOARD STATS
// ─────────────────────────────────────────────────────────────

const getDashboardStats = async () => {
  const [
    totalUsers,
    totalStudents,
    totalMentors,
    totalCourses,
    publishedCourses,
    totalEnrollments,
    totalAssignments,
    totalSubmissions,
    totalProblems,
    totalDiscussions,
    recentUsers,
    recentEnrollments,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: { roleName: "student" } } }),
    prisma.user.count({ where: { role: { roleName: "mentor" } } }),
    prisma.course.count(),
    prisma.course.count({ where: { status: "published" } }),
    prisma.enrollment.count(),
    prisma.assignment.count(),
    prisma.assignmentSubmission.count(),
    prisma.codingProblem.count(),
    prisma.discussion.count(),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        userId: true,
        userName: true,
        fullName: true,
        email: true,
        createdAt: true,
        role: { select: { roleName: true } },
      },
    }),
    prisma.enrollment.findMany({
      take: 5,
      orderBy: { enrolledAt: "desc" },
      include: {
        student: { select: { userId: true, fullName: true, userName: true } },
        course: { select: { courseId: true, courseName: true } },
      },
    }),
  ]);

  // Calculate Platform Revenue
  const allCourses = await prisma.course.findMany({
    select: {
      price: true,
      _count: { select: { enrollments: true } },
    },
  });

  const totalRevenue = allCourses.reduce(
    (totalSum, courseItem) =>
      totalSum + courseItem.price * courseItem._count.enrollments,
    0,
  );

  // Calculate Completion Rate
  const completionResult = await prisma.enrollment.aggregate({
    _avg: { progress: true },
  });
  const completionRate = completionResult._avg.progress
    ? parseFloat(completionResult._avg.progress.toFixed(2))
    : 0;

  // Calculate New Users in last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newUsersCount = await prisma.user.count({
    where: { createdAt: { gte: thirtyDaysAgo } },
  });

  // System Health (using OS module)
  const cpus = os.cpus();
  const serverLoad =
    cpus.reduce((accumulator, cpu) => {
      const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
      const idle = cpu.times.idle;
      return accumulator + (total - idle) / total;
    }, 0) / cpus.length;

  const systemHealth = {
    status: "Operational",
    serverLoad: parseFloat((serverLoad * 100).toFixed(1)),
    freeMem: os.freemem(),
    totalMem: os.totalmem(),
  };

  return {
    overview: {
      totalUsers,
      newUsers: newUsersCount,
      totalStudents,
      totalMentors,
      totalCourses,
      publishedCourses,
      totalEnrollments,
      totalRevenue,
      completionRate,
      totalAssignments,
      totalSubmissions,
      totalProblems,
      totalDiscussions,
      systemHealth,
    },
    recentUsers,
    recentEnrollments,
  };
};

// ─────────────────────────────────────────────────────────────
// USER MANAGEMENT
// ─────────────────────────────────────────────────────────────

const getAllUsers = async (filters, pagination) => {
  const { search, role, isActive } = filters;
  const { skip, take } = pagination;

  const where = {};

  if (search) {
    where.OR = [
      { userName: { contains: search, mode: "insensitive" } },
      { fullName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  if (role) {
    where.role = { roleName: role };
  }

  if (isActive !== undefined) {
    where.isActive = isActive === "true" || isActive === true;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      select: {
        userId: true,
        userName: true,
        fullName: true,
        email: true,
        mobile: true,
        profileUrl: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        role: { select: { roleId: true, roleName: true } },
        _count: {
          select: {
            enrollments: true,
            coursesTaught: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total };
};

const getUserById = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { userId: parseInt(userId) },
    select: {
      userId: true,
      userName: true,
      fullName: true,
      email: true,
      mobile: true,
      bio: true,
      skills: true,
      socialLinks: true,
      profileUrl: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      modifiedAt: true,
      role: { select: { roleId: true, roleName: true } },
      enrollments: {
        include: {
          course: {
            select: { courseId: true, courseName: true, courseCode: true },
          },
        },
      },
      coursesTaught: {
        select: {
          courseId: true,
          courseName: true,
          courseCode: true,
          status: true,
        },
      },
      _count: {
        select: {
          enrollments: true,
          coursesTaught: true,
          submissions: true,
          codingSubmissions: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

const createUser = async (data) => {
  await validateUserData(data, true);
  const { userName, fullName, email, mobile, password, roleId } = data;

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

  const userPassword = password || "Payilagam@123";
  const hashedPassword = await bcrypt.hash(userPassword, 10);

  const user = await prisma.user.create({
    data: {
      userName,
      fullName,
      email,
      mobile,
      password: hashedPassword,
      roleId: roleId || 3,
      mustChangePassword: true, // Force password change for admin-created users
    },
    include: { role: true },
  });

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

const updateUser = async (userId, data) => {
  userId = userIdValue(userId);
  if (!await prisma.user.findUnique({ where: { userId } })) throw userError('User not found', 404);
  await validateUserData(data, false, userId);
  const { fullName, email, mobile, roleId, isActive, bio } = data;

  const user = await prisma.user.update({
    where: { userId: parseInt(userId) },
    data: {
      ...(fullName && { fullName }),
      ...(email && { email }),
      ...(mobile && { mobile }),
      ...(roleId && { roleId }),
      ...(isActive !== undefined && { isActive }),
      ...(bio !== undefined && { bio }),
    },
    include: { role: true },
  });

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

const deleteUser = async (userId) => {
  userId = userIdValue(userId);
  const user = await prisma.user.findUnique({
    where: { userId: parseInt(userId) },
  });

  if (!user) {
    throw userError("User not found", 404);
  }

  // Soft delete by deactivating
  await prisma.user.update({
    where: { userId: parseInt(userId) },
    data: { isActive: false },
  });

  return { message: "User deactivated successfully" };
};

const toggleUserStatus = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { userId: parseInt(userId) },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const updated = await prisma.user.update({
    where: { userId: parseInt(userId) },
    data: { isActive: !user.isActive },
    include: { role: true },
  });

  const { password: _, ...userWithoutPassword } = updated;
  return userWithoutPassword;
};

const resetUserPassword = async (userId, newPassword) => {
  const user = await prisma.user.findUnique({
    where: { userId: parseInt(userId) },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { userId: parseInt(userId) },
    data: { password: hashedPassword },
  });

  return { message: "Password reset successfully" };
};

// ─────────────────────────────────────────────────────────────
// ROLE MANAGEMENT
// ─────────────────────────────────────────────────────────────

const getAllRoles = async () => {
  return prisma.role.findMany({
    include: {
      _count: {
        select: { users: true },
      },
    },
  });
};

const createRole = async (roleName) => {
  const existing = await prisma.role.findUnique({
    where: { roleName },
  });

  if (existing) {
    throw new Error("Role already exists");
  }

  return prisma.role.create({
    data: { roleName },
  });
};

// ─────────────────────────────────────────────────────────────
// PLATFORM ANALYTICS
// ─────────────────────────────────────────────────────────────

const getEnrollmentAnalytics = async (days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const enrollments = await prisma.enrollment.findMany({
    where: {
      enrolledAt: { gte: startDate },
    },
    select: {
      enrolledAt: true,
    },
    orderBy: { enrolledAt: "asc" },
  });

  // Group by date
  const dailyCounts = {};
  enrollments.forEach((enrollmentItem) => {
    const date = enrollmentItem.enrolledAt.toISOString().split("T")[0];
    dailyCounts[date] = (dailyCounts[date] || 0) + 1;
  });

  return {
    period: `Last ${days} days`,
    totalEnrollments: enrollments.length,
    dailyBreakdown: dailyCounts,
  };
};

const getCourseAnalytics = async () => {
  const courses = await prisma.course.findMany({
    select: {
      courseId: true,
      courseName: true,
      courseCode: true,
      status: true,
      level: true,
      _count: {
        select: {
          enrollments: true,
          assignments: true,
          reviews: true,
        },
      },
    },
    orderBy: {
      enrollments: { _count: "desc" },
    },
    take: 20,
  });

  return courses;
};

// ─────────────────────────────────────────────────────────────
// SYSTEM AUDIT LOGS
// ─────────────────────────────────────────────────────────────

const getAuditLogs = async () => {
  return prisma.auditLog.findMany({
    orderBy: { timestamp: "desc" },
    take: 50,
    include: {
      user: { select: { fullName: true, userName: true } },
    },
  });
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  resetUserPassword,
  getAllRoles,
  createRole,
  getEnrollmentAnalytics,
  getCourseAnalytics,
  getAuditLogs,
};
