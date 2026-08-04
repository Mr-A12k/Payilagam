const prisma = require("../../config/prisma");
const {
  getPaginationParams,
  getPaginationMeta,
  getSortParams,
} = require("../../utils/pagination");

/**
 * Create a new course
 */
const createCourse = async (mentorId, data) => {
  const {
    courseName,
    courseCode,
    description,
    thumbnail,
    price,
    level,
    status,
    categoryId,
    duration,
  } = data;

  // Check for duplicate course code
  const existing = await prisma.course.findUnique({ where: { courseCode } });
  if (existing) {
    throw new Error("Course with this code already exists");
  }

  // Validate categoryId if provided
  if (categoryId) {
    const category = await prisma.category.findUnique({
      where: { categoryId },
    });
    if (!category) {
      throw new Error("Category not found");
    }
  }

  const course = await prisma.course.create({
    data: {
      courseName,
      courseCode,
      description: description || null,
      thumbnail: thumbnail || null,
      price: price || 0,
      level: level || "beginner",
      status: status || "draft",
      categoryId: categoryId || null,
      duration: duration || null,
      mentorId,
    },
    include: {
      mentor: {
        select: {
          userId: true,
          fullName: true,
          userName: true,
          profileUrl: true,
        },
      },
      category: true,
    },
  });

  return course;
};

/**
 * Get all courses with pagination and filters
 */
const getAllCourses = async (filters) => {
  const { page, limit, skip, take } = getPaginationParams(filters);
  const orderBy = getSortParams(
    filters,
    ["createdAt", "price", "courseName"],
    "createdAt",
    "desc",
  );

  // Build where clause from filters
  const where = {};

  if (filters.categoryId) {
    const ids = Array.isArray(filters.categoryId)
      ? filters.categoryId
      : filters.categoryId.split(",");
    where.categoryId = {
      in: ids.map((id) => parseInt(id)).filter((id) => !isNaN(id)),
    };
  }

  if (filters.categorySlug) {
    const slugs = Array.isArray(filters.categorySlug)
      ? filters.categorySlug
      : filters.categorySlug.split(",");
    where.category = { slug: { in: slugs } };
  }

  if (filters.level) {
    const levels = Array.isArray(filters.level)
      ? filters.level
      : filters.level.split(",");
    where.level = { in: levels.map((l) => l.toLowerCase()) };
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.mentorId) {
    where.mentorId = parseInt(filters.mentorId);
  }

  if (filters.search) {
    where.OR = [
      { courseName: { contains: filters.search, mode: "insensitive" } },
      { courseCode: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {};
    if (filters.minPrice !== undefined) {
      where.price.gte = parseFloat(filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      where.price.lte = parseFloat(filters.maxPrice);
    }
  }

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        mentor: {
          select: {
            userId: true,
            fullName: true,
            userName: true,
            profileUrl: true,
          },
        },
        category: {
          select: {
            categoryId: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            reviews: true,
          },
        },
      },
    }),
    prisma.course.count({ where }),
  ]);

  const pagination = getPaginationMeta(total, page, limit);
  return { courses, pagination };
};

const resolveCourseWhere = (identifier) => {
  const asInt = parseInt(identifier);
  if (!isNaN(asInt) && asInt.toString() === String(identifier)) {
    return { courseId: asInt };
  }
  return { uniqueId: identifier };
};

/**
 * Get a single course by ID with full details
 */
const getCourseById = async (id, user = null) => {
  const course = await prisma.course.findUnique({
    where: resolveCourseWhere(id),
    include: {
      mentor: {
        select: {
          userId: true,
          fullName: true,
          userName: true,
          profileUrl: true,
          bio: true,
        },
      },
      category: true,
      modules: {
        orderBy: { orderIndex: "asc" },
        include: {
          lessons: {
            orderBy: { orderIndex: "asc" },
            select: {
              lessonId: true,
              title: true,
              type: true,
              duration: true,
              orderIndex: true,
              isFree: true,
            },
          },
        },
      },
      _count: {
        select: {
          enrollments: true,
          reviews: true,
        },
      },
    },
  });

  if (!course) {
    throw new Error("Course not found");
  }

  // Calculate average rating
  const ratingResult = await prisma.courseReview.aggregate({
    where: { courseId: course.courseId },
    _avg: { rating: true },
  });

  // Determine field-level access
  const accessControls = [];
  if (user) {
    if (user.role === "admin") {
      accessControls.push("ac_c_e", "ac_c_d", "ac_m_c"); // Admin can edit, delete, create modules
    } else if (user.role === "mentor" && course.mentorId === user.userId) {
      accessControls.push("ac_c_e", "ac_m_c"); // Mentor can edit, create modules for their own course
    }
  }

  return {
    ...course,
    averageRating: ratingResult._avg.rating
      ? parseFloat(ratingResult._avg.rating.toFixed(1))
      : null,
    accessControls,
  };
};

/**
 * Update a course - only the course mentor or admin can update
 */
const updateCourse = async (courseId, mentorId, data) => {
  const existing = await prisma.course.findUnique({
    where: resolveCourseWhere(courseId),
  });

  if (!existing) {
    throw new Error("Course not found");
  }

  // Check ownership (mentorId will be null for admin bypass)
  if (mentorId && existing.mentorId !== mentorId) {
    throw new Error("You are not authorized to update this course");
  }

  // If courseCode is being changed, check for duplicates
  if (data.courseCode && data.courseCode !== existing.courseCode) {
    const duplicate = await prisma.course.findUnique({
      where: { courseCode: data.courseCode },
    });
    if (duplicate) {
      throw new Error("Course with this code already exists");
    }
  }

  // Validate categoryId if being updated
  if (data.categoryId) {
    const category = await prisma.category.findUnique({
      where: { categoryId: data.categoryId },
    });
    if (!category) {
      throw new Error("Category not found");
    }
  }

  const updateData = {};
  if (data.courseName !== undefined) updateData.courseName = data.courseName;
  if (data.courseCode !== undefined) updateData.courseCode = data.courseCode;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.thumbnail !== undefined) updateData.thumbnail = data.thumbnail;
  if (data.price !== undefined) updateData.price = data.price;
  if (data.level !== undefined) updateData.level = data.level;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
  if (data.duration !== undefined) updateData.duration = data.duration;

  const updated = await prisma.course.update({
    where: { courseId: existing.courseId },
    data: updateData,
    include: {
      mentor: {
        select: {
          userId: true,
          fullName: true,
          userName: true,
          profileUrl: true,
        },
      },
      category: true,
    },
  });

  return updated;
};

/**
 * Delete a course - only admin can delete
 */
const deleteCourse = async (courseId, userId, userRole) => {
  const course = await prisma.course.findUnique({
    where: resolveCourseWhere(courseId),
  });

  if (!course) {
    throw new Error("Course not found");
  }

  // Only Admin can delete a course.
  if (userRole !== "admin") {
    throw new Error(
      "You are not authorized to delete courses. Please request deletion.",
    );
  }

  await prisma.course.delete({
    where: { courseId: course.courseId },
  });

  return { message: "Course deleted successfully" };
};

/**
 * Get courses by a specific mentor with pagination
 */
const getMentorCourses = async (mentorId, query) => {
  const { page, limit, skip, take } = getPaginationParams(query);
  const orderBy = getSortParams(
    query,
    ["createdAt", "courseName", "price"],
    "createdAt",
    "desc",
  );

  const where = { mentorId };

  if (query.status) {
    where.status = query.status;
  }

  if (query.search) {
    where.OR = [
      { courseName: { contains: query.search, mode: "insensitive" } },
      { courseCode: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        category: {
          select: {
            categoryId: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            reviews: true,
            modules: true,
          },
        },
      },
    }),
    prisma.course.count({ where }),
  ]);

  const pagination = getPaginationMeta(total, page, limit);
  return { courses, pagination };
};

/**
 * Get published courses (public endpoint)
 */
const getPublishedCourses = async (filters) => {
  const { page, limit, skip, take } = getPaginationParams(filters);
  const orderBy = getSortParams(
    filters,
    ["createdAt", "price", "courseName"],
    "createdAt",
    "desc",
  );

  const where = { status: "published" };

  if (filters.categoryId) {
    const ids = Array.isArray(filters.categoryId)
      ? filters.categoryId
      : filters.categoryId.split(",");
    where.categoryId = {
      in: ids.map((id) => parseInt(id)).filter((id) => !isNaN(id)),
    };
  }

  if (filters.categorySlug) {
    const slugs = Array.isArray(filters.categorySlug)
      ? filters.categorySlug
      : filters.categorySlug.split(",");
    where.category = { slug: { in: slugs } };
  }

  if (filters.level) {
    const levels = Array.isArray(filters.level)
      ? filters.level
      : filters.level.split(",");
    where.level = { in: levels.map((l) => l.toLowerCase()) };
  }

  if (filters.search) {
    where.OR = [
      { courseName: { contains: filters.search, mode: "insensitive" } },
      { courseCode: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {};
    if (filters.minPrice !== undefined) {
      where.price.gte = parseFloat(filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      where.price.lte = parseFloat(filters.maxPrice);
    }
  }

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        mentor: {
          select: {
            userId: true,
            fullName: true,
            userName: true,
            profileUrl: true,
          },
        },
        category: {
          select: {
            categoryId: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            reviews: true,
          },
        },
      },
    }),
    prisma.course.count({ where }),
  ]);

  const pagination = getPaginationMeta(total, page, limit);
  return { courses, pagination };
};

/**
 * Get top-level stats for a mentor's dashboard
 */
const getMentorStats = async (mentorId) => {
  // Get all courses by this mentor
  const courses = await prisma.course.findMany({
    where: { mentorId: parseInt(mentorId) },
    select: {
      courseId: true,
      price: true,
      _count: {
        select: { enrollments: true, reviews: true },
      },
    },
  });

  if (!courses || courses.length === 0) {
    return {
      totalEnrollment: 0,
      avgCompletion: 0,
      platformRating: 0,
      totalRevenue: 0,
    };
  }

  let totalEnrollment = 0;
  let totalRevenue = 0;

  courses.forEach((c) => {
    totalEnrollment += courseItem._count.enrollments;
    totalRevenue += courseItem._count.enrollments * courseItem.price;
  });

  // Average Completion
  const courseIds = courses.map((c) => courseItem.courseId);

  const completionResult = await prisma.enrollment.aggregate({
    where: { courseId: { in: courseIds } },
    _avg: { progress: true },
  });
  const avgCompletion = completionResult._avg.progress
    ? parseFloat(completionResult._avg.progress.toFixed(2))
    : 0;

  // Platform Rating
  const ratingResult = await prisma.courseReview.aggregate({
    where: { courseId: { in: courseIds } },
    _avg: { rating: true },
  });
  const platformRating = ratingResult._avg.rating
    ? parseFloat(ratingResult._avg.rating.toFixed(2))
    : 0;

  return {
    totalEnrollment,
    avgCompletion,
    platformRating,
    totalRevenue,
  };
};

const requestCourseDeletion = async (courseId, userId) => {
  const course = await prisma.course.findUnique({
    where: resolveCourseWhere(courseId),
    include: { mentor: true },
  });

  if (!course) {
    throw new Error("Course not found");
  }

  if (course.mentorId !== userId) {
    throw new Error("Only the course mentor can request deletion");
  }

  // Find all admins
  const admins = await prisma.user.findMany({
    where: { role: { roleName: "admin" } },
  });

  // Create a notification for each admin
  const notifications = admins.map((admin) => ({
    userId: admin.userId,
    type: "request",
    title: "Course Deletion Request",
    message: `Mentor ${course.mentor.fullName} has requested the deletion of the course "${course.courseName}" (${course.courseCode}).`,
    metadata: JSON.stringify({
      courseId: course.courseId,
      uniqueId: course.uniqueId,
      mentorId: userId,
    }),
  }));

  if (notifications.length > 0) {
    await prisma.notification.createMany({ data: notifications });
  }

  return { message: "Deletion request sent to Administrators." };
};

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  requestCourseDeletion,
  getMentorCourses,
  getPublishedCourses,
  getMentorStats,
};
