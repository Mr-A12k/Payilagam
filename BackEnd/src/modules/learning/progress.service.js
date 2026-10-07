const prisma = require("../../config/prisma");
const { integer, fail, services } = require('./validation');
const verifyEnrollment = async (studentId, courseId) => {
  const enrollment = await prisma.enrollment.findUnique({ where: { studentId_courseId: { studentId: Number(studentId), courseId } } });
  if (!enrollment || enrollment.status === 'dropped') fail('Not enrolled in this course', 403);
};

/**
 * Recalculate the enrollment progress percentage for a student in a course.
 * If progress reaches 100%, mark enrollment as completed.
 */
const recalculateCourseProgress = async (studentId, courseId) => {
  // Count total lessons in the course
  const totalLessons = await prisma.lesson.count({
    where: {
      module: { courseId: parseInt(courseId) },
    },
  });

  if (totalLessons === 0) return 0;

  // Count completed lessons by this student for this course
  const completedLessons = await prisma.lessonProgress.count({
    where: {
      studentId: parseInt(studentId),
      completed: true,
      lesson: {
        module: { courseId: parseInt(courseId) },
      },
    },
  });

  const progress = parseFloat(
    ((completedLessons / totalLessons) * 100).toFixed(2),
  );

  const updateData = { progress };

  if (progress >= 100) {
    updateData.status = "completed";
    updateData.completedAt = new Date();
  } else {
    updateData.status = "active";
    updateData.completedAt = null;
  }

  await prisma.enrollment.update({
    where: {
      studentId_courseId: {
        studentId: parseInt(studentId),
        courseId: parseInt(courseId),
      },
    },
    data: updateData,
  });

  return progress;
};

/**
 * Mark a lesson as complete and recalculate course progress
 */
const markLessonComplete = async (studentId, lessonId) => {
  const lesson = await prisma.lesson.findUnique({
    where: { lessonId: parseInt(lessonId) },
    include: { module: true },
  });

  if (!lesson) {
    throw new Error("Lesson not found");
  }

  // Verify student is enrolled in the course
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_courseId: {
        studentId: parseInt(studentId),
        courseId: lesson.module.courseId,
      },
    },
  });

  if (!enrollment || enrollment.status === 'dropped') {
    throw new Error("Not enrolled in this course");
  }

  const progress = await prisma.lessonProgress.upsert({
    where: {
      studentId_lessonId: {
        studentId: parseInt(studentId),
        lessonId: parseInt(lessonId),
      },
    },
    update: {
      completed: true,
      completedAt: new Date(),
    },
    create: {
      studentId: parseInt(studentId),
      lessonId: parseInt(lessonId),
      completed: true,
      completedAt: new Date(),
    },
  });

  const courseProgress = await recalculateCourseProgress(
    studentId,
    lesson.module.courseId,
  );

  return { lessonProgress: progress, courseProgress };
};

/**
 * Unmark a lesson as complete and recalculate course progress
 */
const markLessonIncomplete = async (studentId, lessonId) => {
  const lesson = await prisma.lesson.findUnique({
    where: { lessonId: parseInt(lessonId) },
    include: { module: true },
  });

  if (!lesson) {
    throw new Error("Lesson not found");
  }

  await verifyEnrollment(studentId, lesson.module.courseId);
  const existing = await prisma.lessonProgress.findUnique({
    where: {
      studentId_lessonId: {
        studentId: parseInt(studentId),
        lessonId: parseInt(lessonId),
      },
    },
  });

  if (!existing) {
    throw new Error("No progress record found for this lesson");
  }

  const progress = await prisma.lessonProgress.update({
    where: {
      studentId_lessonId: {
        studentId: parseInt(studentId),
        lessonId: parseInt(lessonId),
      },
    },
    data: {
      completed: false,
      completedAt: null,
    },
  });

  const courseProgress = await recalculateCourseProgress(
    studentId,
    lesson.module.courseId,
  );

  return { lessonProgress: progress, courseProgress };
};

/**
 * Update watch time (in seconds) for a lesson
 */
const updateWatchTime = async (studentId, lessonId, watchTime) => {
  integer(watchTime, 'watchTime', 0);
  const lesson = await prisma.lesson.findUnique({
    where: { lessonId: parseInt(lessonId) },
    include: { module: true },
  });

  if (!lesson) {
    throw new Error("Lesson not found");
  }

  await verifyEnrollment(studentId, lesson.module.courseId);
  const progress = await prisma.lessonProgress.upsert({
    where: {
      studentId_lessonId: {
        studentId: parseInt(studentId),
        lessonId: parseInt(lessonId),
      },
    },
    update: {
      watchTime: parseInt(watchTime),
    },
    create: {
      studentId: parseInt(studentId),
      lessonId: parseInt(lessonId),
      watchTime: parseInt(watchTime),
    },
  });

  return progress;
};

/**
 * Get detailed course progress: each module with its lessons and completion status
 */
const getCourseProgress = async (studentId, courseId) => {
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_courseId: {
        studentId: parseInt(studentId),
        courseId: parseInt(courseId),
      },
    },
  });

  if (!enrollment || enrollment.status === 'dropped') {
    throw new Error("Not enrolled in this course");
  }

  const modules = await prisma.courseModule.findMany({
    where: { courseId: parseInt(courseId) },
    orderBy: { orderIndex: "asc" },
    include: {
      lessons: {
        orderBy: { orderIndex: "asc" },
        include: {
          lessonProgress: {
            where: { studentId: parseInt(studentId) },
            select: {
              completed: true,
              completedAt: true,
              watchTime: true,
            },
          },
        },
      },
    },
  });

  // Transform the data for cleaner response
  const modulesWithProgress = modules.map((mod) => {
    const lessons = mod.lessons.map((lesson) => {
      const progress = lesson.lessonProgress[0] || null;
      return {
        lessonId: lesson.lessonId,
        title: lesson.title,
        type: lesson.type,
        duration: lesson.duration,
        orderIndex: lesson.orderIndex,
        completed: progress ? progress.completed : false,
        completedAt: progress ? progress.completedAt : null,
        watchTime: progress ? progress.watchTime : 0,
      };
    });

    const completedCount = lessons.filter((l) => l.completed).length;

    return {
      moduleId: mod.moduleId,
      title: mod.title,
      description: mod.description,
      orderIndex: mod.orderIndex,
      totalLessons: lessons.length,
      completedLessons: completedCount,
      lessons,
    };
  });

  return {
    courseId: parseInt(courseId),
    overallProgress: enrollment.progress,
    status: enrollment.status,
    enrolledAt: enrollment.enrolledAt,
    completedAt: enrollment.completedAt,
    modules: modulesWithProgress,
  };
};

/**
 * Get student dashboard: aggregate stats across all enrolled courses
 */
const getStudentDashboard = async (studentId) => {
  const sid = parseInt(studentId);

  const [totalCourses, completedCourses, totalLessonsCompleted, enrollments] =
    await Promise.all([
      prisma.enrollment.count({ where: { studentId: sid } }),
      prisma.enrollment.count({
        where: { studentId: sid, status: "completed" },
      }),
      prisma.lessonProgress.count({
        where: { studentId: sid, completed: true },
      }),
      prisma.enrollment.findMany({
        where: { studentId: sid, status: "active" },
        orderBy: { enrolledAt: "desc" },
        take: 5,
        include: {
          course: {
            select: {
              courseId: true,
              courseName: true,
              courseCode: true,
              thumbnail: true,
              totalLessons: true,
            },
          },
        },
      }),
    ]);

  // Calculate streak: count consecutive days with at least one lesson completed
  const recentCompletions = await prisma.lessonProgress.findMany({
    where: {
      studentId: sid,
      completed: true,
      completedAt: { not: null },
    },
    orderBy: { completedAt: "desc" },
    select: { completedAt: true },
  });

  let currentStreak = 0;
  if (recentCompletions.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Build a set of unique completion dates (date strings)
    const completionDates = new Set(
      recentCompletions.map((r) => {
        const d = new Date(r.completedAt);
        d.setHours(0, 0, 0, 0);
        return d.toISOString();
      }),
    );

    const uniqueDates = Array.from(completionDates)
      .map((d) => new Date(d))
      .sort((a, b) => b - a);

    // Check if today or yesterday had a completion to start the streak
    const diffFirst = Math.floor(
      (today - uniqueDates[0]) / (1000 * 60 * 60 * 24),
    );
    if (diffFirst <= 1) {
      currentStreak = 1;
      for (let i = 1; i < uniqueDates.length; i++) {
        const diff = Math.floor(
          (uniqueDates[i - 1] - uniqueDates[i]) / (1000 * 60 * 60 * 24),
        );
        if (diff === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
  }

  // Fetch upcoming deadlines (Assignments where dueDate > now and student is enrolled)
  const enrolledCourseIds = enrollments.map((e) => e.courseId);
  const upcomingDeadlines = await prisma.assignment.findMany({
    where: {
      courseId: { in: enrolledCourseIds },
      dueDate: { gt: new Date() },
    },
    orderBy: { dueDate: "asc" },
    take: 5,
    include: {
      course: { select: { courseName: true } },
    },
  });

  return {
    totalCourses,
    completedCourses,
    inProgressCourses: totalCourses - completedCourses,
    totalLessonsCompleted,
    currentStreak,
    recentCourses: enrollments,
    upcomingDeadlines: upcomingDeadlines.map(assignment => require('./quiz').publicAssignment(assignment)),
  };
};

module.exports = services({
  markLessonComplete,
  markLessonIncomplete,
  updateWatchTime,
  getCourseProgress,
  getStudentDashboard,
});
