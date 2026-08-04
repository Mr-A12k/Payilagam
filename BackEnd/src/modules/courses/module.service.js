const prisma = require("../../config/prisma");

/**
 * Verify that the user is the course mentor or an admin.
 * Returns the course if authorized, throws otherwise.
 */
const verifyCourseOwnership = async (courseId, userId, userRole) => {
  const course = await prisma.course.findUnique({
    where: { courseId },
  });

  if (!course) {
    throw new Error("Course not found");
  }

  if (course.mentorId !== userId && userRole !== "admin") {
    throw new Error("You are not authorized to manage modules for this course");
  }

  return course;
};

/**
 * Verify ownership via a module's course.
 * Returns the module (with course) if authorized, throws otherwise.
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
    throw new Error("You are not authorized to manage this module");
  }

  return module;
};

const createModule = async (
  courseIdentifier,
  mentorId,
  data,
  userRole = "mentor",
) => {
  // Resolve course by uniqueId or courseId
  const asInt = parseInt(courseIdentifier);
  const whereCourse =
    !isNaN(asInt) && asInt.toString() === String(courseIdentifier)
      ? { courseId: asInt }
      : { uniqueId: courseIdentifier };

  const course = await prisma.course.findUnique({
    where: whereCourse,
  });
  if (!course) throw new Error("Course not found");
  const courseId = course.courseId;

  await verifyCourseOwnership(courseId, mentorId, userRole);

  const { title, description, orderIndex } = data;

  // If no orderIndex provided, place it at the end
  let finalOrderIndex = orderIndex;
  if (finalOrderIndex === undefined || finalOrderIndex === null) {
    const lastModule = await prisma.courseModule.findFirst({
      where: { courseId },
      orderBy: { orderIndex: "desc" },
    });
    finalOrderIndex = lastModule ? lastModule.orderIndex + 1 : 0;
  }

  const module = await prisma.courseModule.create({
    data: {
      courseId,
      title,
      description: description || null,
      orderIndex: finalOrderIndex,
    },
    include: {
      lessons: true,
    },
  });

  return module;
};

/**
 * Get all modules for a course, ordered by orderIndex, with lesson count.
 */
const getModulesByCourse = async (courseIdentifier) => {
  // Resolve course by uniqueId or courseId
  const asInt = parseInt(courseIdentifier);
  const whereCourse =
    !isNaN(asInt) && asInt.toString() === String(courseIdentifier)
      ? { courseId: asInt }
      : { uniqueId: courseIdentifier };

  const course = await prisma.course.findUnique({
    where: whereCourse,
  });

  if (!course) {
    throw new Error("Course not found");
  }

  const modules = await prisma.courseModule.findMany({
    where: { courseId: course.courseId },
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
      _count: {
        select: { lessons: true },
      },
    },
  });

  return modules.map((mod) => ({
    ...mod,
    lessonCount: mod._count.lessons,
    _count: undefined,
  }));
};

/**
 * Get a single module with all its lessons.
 */
const getModuleById = async (moduleId) => {
  const module = await prisma.courseModule.findUnique({
    where: { moduleId },
    include: {
      lessons: {
        orderBy: { orderIndex: "asc" },
      },
      course: {
        select: {
          courseId: true,
          courseName: true,
          courseCode: true,
          mentorId: true,
        },
      },
    },
  });

  if (!module) {
    throw new Error("Module not found");
  }

  return module;
};

/**
 * Update a module. Verifies mentor ownership.
 */
const updateModule = async (moduleId, mentorId, data, userRole = "mentor") => {
  await verifyModuleOwnership(moduleId, mentorId, userRole);

  const { title, description, orderIndex } = data;

  const updated = await prisma.courseModule.update({
    where: { moduleId },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(orderIndex !== undefined && { orderIndex }),
    },
    include: {
      lessons: {
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  return updated;
};

/**
 * Delete a module. Verifies mentor ownership. Lessons cascade-delete via schema.
 */
const deleteModule = async (moduleId, mentorId, userRole = "mentor") => {
  const module = await verifyModuleOwnership(moduleId, mentorId, userRole);

  // Get lesson count before deletion so we can update totalLessons on the course
  const lessonCount = await prisma.lesson.count({
    where: { moduleId },
  });

  await prisma.courseModule.delete({
    where: { moduleId },
  });

  // Update the course's totalLessons count
  if (lessonCount > 0) {
    await prisma.course.update({
      where: { courseId: module.courseId },
      data: {
        totalLessons: { decrement: lessonCount },
      },
    });
  }

  return { message: "Module deleted successfully" };
};

/**
 * Reorder modules for a course.
 * moduleOrders: array of { moduleId, orderIndex }
 */
const reorderModules = async (
  courseIdentifier,
  mentorId,
  moduleOrders,
  userRole = "mentor",
) => {
  // Resolve course by uniqueId or courseId
  const asInt = parseInt(courseIdentifier);
  const whereCourse =
    !isNaN(asInt) && asInt.toString() === String(courseIdentifier)
      ? { courseId: asInt }
      : { uniqueId: courseIdentifier };

  const course = await prisma.course.findUnique({
    where: whereCourse,
  });
  if (!course) throw new Error("Course not found");
  const courseId = course.courseId;

  await verifyCourseOwnership(courseId, mentorId, userRole);

  if (!Array.isArray(moduleOrders) || moduleOrders.length === 0) {
    throw new Error("moduleOrders must be a non-empty array");
  }

  // Run all updates in a transaction
  const updates = moduleOrders.map(({ moduleId, orderIndex }) =>
    prisma.courseModule.update({
      where: { moduleId },
      data: { orderIndex },
    }),
  );

  await prisma.$transaction(updates);

  // Return reordered modules
  const modules = await prisma.courseModule.findMany({
    where: { courseId },
    orderBy: { orderIndex: "asc" },
    include: {
      _count: {
        select: { lessons: true },
      },
    },
  });

  return modules.map((mod) => ({
    ...mod,
    lessonCount: mod._count.lessons,
    _count: undefined,
  }));
};

module.exports = {
  createModule,
  getModulesByCourse,
  getModuleById,
  updateModule,
  deleteModule,
  reorderModules,
};
