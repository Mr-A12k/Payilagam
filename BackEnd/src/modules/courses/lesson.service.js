const prisma = require("../../config/prisma");

/**
 * Verify that the user owns the course that contains this module (or is admin).
 * Returns the module with its course if authorized, throws otherwise.
 */
const verifyModuleOwnership = async (moduleId, userId, userRole) => {
  const module = await prisma.courseModule.findUnique({
    where: { moduleId },
    include: { course: true },
  });

  if (!module) {
    throw new Error("Module not found");
  }

  if (module.course.mentorId !== userId && userRole !== "admin") {
    throw new Error("You are not authorized to manage lessons for this module");
  }

  return module;
};

/**
 * Verify ownership via a lesson's module's course.
 * Returns the lesson (with module and course) if authorized, throws otherwise.
 */
const verifyLessonOwnership = async (lessonId, userId, userRole) => {
  const lesson = await prisma.lesson.findUnique({
    where: { lessonId },
    include: {
      module: {
        include: { course: true },
      },
    },
  });

  if (!lesson) {
    throw new Error("Lesson not found");
  }

  if (lesson.module.course.mentorId !== userId && userRole !== "admin") {
    throw new Error("You are not authorized to manage this lesson");
  }

  return lesson;
};

/**
 * Update the totalLessons count on a course by counting all lessons across its modules.
 */
const updateCourseLessonCount = async (courseId) => {
  const count = await prisma.lesson.count({
    where: {
      module: {
        courseId,
      },
    },
  });

  await prisma.course.update({
    where: { courseId },
    data: { totalLessons: count },
  });
};

/**
 * Create a new lesson for a module.
 */
const createLesson = async (moduleId, userId, data, userRole = "mentor") => {
  const module = await verifyModuleOwnership(moduleId, userId, userRole);

  const { title, type, content, videoUrl, duration, orderIndex, isFree } = data;

  // If no orderIndex provided, place it at the end
  let finalOrderIndex = orderIndex;
  if (finalOrderIndex === undefined || finalOrderIndex === null) {
    const lastLesson = await prisma.lesson.findFirst({
      where: { moduleId },
      orderBy: { orderIndex: "desc" },
    });
    finalOrderIndex = lastLesson ? lastLesson.orderIndex + 1 : 0;
  }

  const lesson = await prisma.lesson.create({
    data: {
      moduleId,
      title,
      type: type || "video",
      content: content || null,
      videoUrl: videoUrl || null,
      duration: duration || null,
      orderIndex: finalOrderIndex,
      isFree: isFree || false,
    },
  });

  // Update course totalLessons count
  await updateCourseLessonCount(module.courseId);

  return lesson;
};

/**
 * Get all lessons for a module, ordered by orderIndex.
 */
const getLessonsByModule = async (moduleId) => {
  const module = await prisma.courseModule.findUnique({
    where: { moduleId },
  });

  if (!module) {
    throw new Error("Module not found");
  }

  const lessons = await prisma.lesson.findMany({
    where: { moduleId },
    orderBy: { orderIndex: "asc" },
  });

  return lessons;
};

/**
 * Get a single lesson by ID.
 * If the requesting user is a student, also include their progress.
 */
const getLessonById = async (lessonId, userId, userRole) => {
  const lesson = await prisma.lesson.findUnique({
    where: { lessonId },
    include: {
      module: {
        select: {
          moduleId: true,
          title: true,
          courseId: true,
          course: {
            select: {
              courseId: true,
              courseName: true,
              courseCode: true,
              mentorId: true,
            },
          },
        },
      },
    },
  });

  if (!lesson) {
    throw new Error("Lesson not found");
  }

  // If user is a student, include their progress for this lesson
  if (userRole === "student" && userId) {
    const progress = await prisma.lessonProgress.findUnique({
      where: {
        studentId_lessonId: {
          studentId: userId,
          lessonId,
        },
      },
    });

    return { ...lesson, progress: progress || null };
  }

  return lesson;
};

/**
 * Update a lesson. Verifies ownership.
 */
const updateLesson = async (lessonId, userId, data, userRole = "mentor") => {
  await verifyLessonOwnership(lessonId, userId, userRole);

  const { title, type, content, videoUrl, duration, orderIndex, isFree } = data;

  const updated = await prisma.lesson.update({
    where: { lessonId },
    data: {
      ...(title !== undefined && { title }),
      ...(type !== undefined && { type }),
      ...(content !== undefined && { content }),
      ...(videoUrl !== undefined && { videoUrl }),
      ...(duration !== undefined && { duration }),
      ...(orderIndex !== undefined && { orderIndex }),
      ...(isFree !== undefined && { isFree }),
    },
  });

  return updated;
};

/**
 * Delete a lesson. Verifies ownership. Updates course totalLessons.
 */
const deleteLesson = async (lessonId, userId, userRole = "mentor") => {
  const lesson = await verifyLessonOwnership(lessonId, userId, userRole);

  await prisma.lesson.delete({
    where: { lessonId },
  });

  // Update course totalLessons count
  await updateCourseLessonCount(lesson.module.courseId);

  return { message: "Lesson deleted successfully" };
};

module.exports = {
  createLesson,
  getLessonsByModule,
  getLessonById,
  updateLesson,
  deleteLesson,
};
