const prisma = require("../../config/prisma");
const { services, fail } = require('./validation');
const {
  getPaginationParams,
  getPaginationMeta,
} = require("../../utils/pagination");
const emailService = require("../../utils/email");

const resolveCourseWhere = (identifier) => {
  const asInt = parseInt(identifier);
  if (!isNaN(asInt) && asInt.toString() === String(identifier)) {
    return { courseId: asInt };
  }
  return { uniqueId: identifier };
};

/**
 * Enroll a student in a course
 * Validates: course exists & is published, student not already enrolled
 */
const enrollStudent = async (studentId, courseIdentifier) => {
  const course = await prisma.course.findUnique({
    where: resolveCourseWhere(courseIdentifier),
  });

  if (!course) {
    throw new Error("Course not found");
  }

  if (course.status !== "published") {
    throw new Error("Course is not available for enrollment");
  }

  const existingEnrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_courseId: {
        studentId: parseInt(studentId),
        courseId: course.courseId,
      },
    },
  });

  if (existingEnrollment) {
    throw new Error("Already enrolled in this course");
  }

  const enrollment = await prisma.enrollment.create({
    data: {
      studentId: parseInt(studentId),
      courseId: course.courseId,
      status: "active",
      progress: 0,
    },
    include: {
      course: {
        select: {
          courseId: true,
          uniqueId: true,
          courseName: true,
          courseCode: true,
          thumbnail: true,
        },
      },
    },
  });

  // Fetch user to get their email address
  const student = await prisma.user.findUnique({
    where: { userId: parseInt(studentId) },
    select: { email: true, fullName: true },
  });

  if (student && student.email) {
    const subject = `Welcome to ${course.courseName}!`;
    const text = `Hi ${student.fullName},\n\nYou have successfully enrolled in ${course.courseName} (${course.courseCode}).\nGet ready to start learning!\n\nRegards,\nTaskPro EdTech Team`;

    // Fire and forget email sending (do not await so it doesn't block the request)
    emailService.sendMail(student.email, subject, text).catch((error) => {
      console.error("Failed to send enrollment email:", error);
    });
  }

  return enrollment;
};

/**
 * Unenroll (drop) a student from a course
 */
const unenrollStudent = async (studentId, courseIdentifier) => {
  const course = await prisma.course.findUnique({
    where: resolveCourseWhere(courseIdentifier),
  });
  if (!course) throw new Error("Course not found");

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_courseId: {
        studentId: parseInt(studentId),
        courseId: course.courseId,
      },
    },
  });

  if (!enrollment) {
    throw new Error("Enrollment not found");
  }

  await prisma.$transaction(async (tx) => {
  await tx.lessonProgress.deleteMany({ where: { studentId: Number(studentId), lesson: { module: { courseId: course.courseId } } } });
  await tx.enrollment.delete({
    where: {
      enrollmentId: enrollment.enrollmentId,
    },
  });
  });

  return { message: "Successfully unenrolled from the course" };
};

/**
 * Get paginated list of courses a student is enrolled in
 */
const getStudentEnrollments = async (studentId, query) => {
  const { page, limit, skip, take } = getPaginationParams(query);

  const where = { studentId: parseInt(studentId) };

  const [enrollments, total] = await Promise.all([
    prisma.enrollment.findMany({
      where,
      skip,
      take,
      orderBy: { enrolledAt: "desc" },
      include: {
        course: {
          select: {
            courseId: true,
            courseName: true,
            courseCode: true,
            thumbnail: true,
            level: true,
            duration: true,
            totalLessons: true,
            mentor: {
              select: {
                userId: true,
                fullName: true,
                profileUrl: true,
              },
            },
          },
        },
      },
    }),
    prisma.enrollment.count({ where }),
  ]);

  const pagination = getPaginationMeta(total, page, limit);

  return { enrollments, pagination };
};

/**
 * Get paginated list of students enrolled in a course (for mentor/admin)
 */
const getCourseEnrollments = async (courseIdentifier, query, user) => {
  const course = await prisma.course.findUnique({
    where: resolveCourseWhere(courseIdentifier),
  });
  if (!course) throw new Error("Course not found");
  if (!user || user.role !== 'admin' && course.mentorId !== user.userId) {
    throw Object.assign(new Error('You can only view students in your own courses'), { statusCode: 403 });
  }
  const courseId = course.courseId;

  const { page, limit, skip, take } = getPaginationParams(query);

  const where = { courseId: parseInt(courseId) };

  const [enrollments, total] = await Promise.all([
    prisma.enrollment.findMany({
      where,
      skip,
      take,
      orderBy: { enrolledAt: "desc" },
      include: {
        student: {
          select: {
            userId: true,
            userName: true,
            fullName: true,
            email: true,
            profileUrl: true,
          },
        },
      },
    }),
    prisma.enrollment.count({ where }),
  ]);

  const pagination = getPaginationMeta(total, page, limit);

  return { enrollments, pagination };
};

/**
 * Check if a student is enrolled in a course
 */
const checkEnrollment = async (studentId, courseIdentifier) => {
  const course = await prisma.course.findUnique({
    where: resolveCourseWhere(courseIdentifier),
  });
  if (!course) throw new Error("Course not found");

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_courseId: {
        studentId: parseInt(studentId),
        courseId: course.courseId,
      },
    },
  });

  return {
    enrolled: !!enrollment,
    enrollment: enrollment || null,
  };
};

/**
 * Get enrollment statistics for a course
 */
const getEnrollmentStats = async (courseIdentifier, user) => {
  const course = await prisma.course.findUnique({
    where: resolveCourseWhere(courseIdentifier),
  });
  if (!course) throw new Error("Course not found");
  const cid = course.courseId;
  if (!user || user.role !== 'admin' && course.mentorId !== user.userId) fail('Not authorized to view enrollment stats', 403);

  const [total, completed, active, dropped] = await Promise.all([
    prisma.enrollment.count({ where: { courseId: cid } }),
    prisma.enrollment.count({ where: { courseId: cid, status: "completed" } }),
    prisma.enrollment.count({ where: { courseId: cid, status: "active" } }),
    prisma.enrollment.count({ where: { courseId: cid, status: "dropped" } }),
  ]);

  return { courseId: cid, total, completed, active, dropped };
};

module.exports = services({
  enrollStudent,
  unenrollStudent,
  getStudentEnrollments,
  getCourseEnrollments,
  checkEnrollment,
  getEnrollmentStats,
});
