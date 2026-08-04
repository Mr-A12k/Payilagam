const prisma = require("../../config/prisma");
const {
  getPaginationParams,
  getPaginationMeta,
  getSortParams,
} = require("../../utils/pagination");

/**
 * Verify the mentor owns the course (or user is admin).
 * Returns the course if valid, throws otherwise.
 */
const verifyMentorOwnership = async (courseId, userId, role) => {
  const course = await prisma.course.findUnique({
    where: { courseId },
  });

  if (!course) {
    throw new Error("Course not found");
  }

  if (role !== "admin" && course.mentorId !== userId) {
    throw new Error(
      "You are not authorized to manage assignments for this course",
    );
  }

  return course;
};

/**
 * Create a new assignment for a course.
 * Mentor must own the course.
 */
const createAssignment = async (mentorId, role, data) => {
  const { title, description, courseId, type, dueDate, totalMarks, problemId } =
    data;

  await verifyMentorOwnership(courseId, mentorId, role);

  // If type is coding_challenge and problemId is provided, verify the problem exists
  if (type === "coding_challenge" && problemId) {
    const problem = await prisma.codingProblem.findUnique({
      where: { problemId },
    });
    if (!problem) {
      throw new Error("Coding problem not found");
    }
  }

  const assignment = await prisma.assignment.create({
    data: {
      title,
      description,
      courseId,
      type: type || "file_upload",
      dueDate: dueDate ? new Date(dueDate) : null,
      totalMarks: totalMarks || 100,
      problemId: problemId || null,
      createdBy: mentorId,
    },
    include: {
      course: {
        select: {
          courseId: true,
          courseName: true,
          courseCode: true,
        },
      },
      problem: {
        select: {
          problemId: true,
          title: true,
          difficulty: true,
        },
      },
      mentor: {
        select: {
          userId: true,
          fullName: true,
        },
      },
    },
  });

  return assignment;
};

/**
 * Get paginated assignments for a course.
 */
const getAssignmentsByCourse = async (courseId, query) => {
  const { page, limit, skip, take } = getPaginationParams(query);
  const orderBy = getSortParams(
    query,
    ["createdAt", "dueDate", "title"],
    "createdAt",
    "desc",
  );

  const where = { courseId: parseInt(courseId) };

  const [assignments, total] = await Promise.all([
    prisma.assignment.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        mentor: {
          select: {
            userId: true,
            fullName: true,
          },
        },
        problem: {
          select: {
            problemId: true,
            title: true,
            difficulty: true,
          },
        },
        _count: {
          select: { submissions: true },
        },
      },
    }),
    prisma.assignment.count({ where }),
  ]);

  const pagination = getPaginationMeta(total, page, limit);
  return { assignments, pagination };
};

/**
 * Get a single assignment by ID with submission count.
 */
const getAssignmentById = async (assignmentId) => {
  const assignment = await prisma.assignment.findUnique({
    where: { assignmentId: parseInt(assignmentId) },
    include: {
      course: {
        select: {
          courseId: true,
          courseName: true,
          courseCode: true,
          mentorId: true,
        },
      },
      mentor: {
        select: {
          userId: true,
          fullName: true,
          email: true,
        },
      },
      problem: {
        select: {
          problemId: true,
          title: true,
          slug: true,
          difficulty: true,
          description: true,
        },
      },
      _count: {
        select: { submissions: true },
      },
    },
  });

  if (!assignment) {
    throw new Error("Assignment not found");
  }

  return assignment;
};

/**
 * Update an assignment. Mentor must own the course.
 */
const updateAssignment = async (assignmentId, mentorId, role, data) => {
  const assignment = await prisma.assignment.findUnique({
    where: { assignmentId: parseInt(assignmentId) },
    include: { course: true },
  });

  if (!assignment) {
    throw new Error("Assignment not found");
  }

  if (role !== "admin" && assignment.course.mentorId !== mentorId) {
    throw new Error("You are not authorized to update this assignment");
  }

  const { title, description, type, dueDate, totalMarks, problemId } = data;

  const updated = await prisma.assignment.update({
    where: { assignmentId: parseInt(assignmentId) },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(type !== undefined && { type }),
      ...(dueDate !== undefined && {
        dueDate: dueDate ? new Date(dueDate) : null,
      }),
      ...(totalMarks !== undefined && { totalMarks }),
      ...(problemId !== undefined && { problemId }),
    },
    include: {
      course: {
        select: {
          courseId: true,
          courseName: true,
          courseCode: true,
        },
      },
      problem: {
        select: {
          problemId: true,
          title: true,
          difficulty: true,
        },
      },
      mentor: {
        select: {
          userId: true,
          fullName: true,
        },
      },
    },
  });

  return updated;
};

/**
 * Delete an assignment. Mentor must own the course.
 */
const deleteAssignment = async (assignmentId, mentorId, role) => {
  const assignment = await prisma.assignment.findUnique({
    where: { assignmentId: parseInt(assignmentId) },
    include: { course: true },
  });

  if (!assignment) {
    throw new Error("Assignment not found");
  }

  if (role !== "admin" && assignment.course.mentorId !== mentorId) {
    throw new Error("You are not authorized to delete this assignment");
  }

  await prisma.assignment.delete({
    where: { assignmentId: parseInt(assignmentId) },
  });

  return { message: "Assignment deleted successfully" };
};

/**
 * Get upcoming assignments for a student (due dates in the future, from enrolled courses).
 */
const getUpcomingAssignments = async (studentId) => {
  // Get all active enrollments for the student
  const enrollments = await prisma.enrollment.findMany({
    where: {
      studentId,
      status: "active",
    },
    select: { courseId: true },
  });

  const courseIds = enrollments.map((e) => e.courseId);

  if (courseIds.length === 0) {
    return [];
  }

  const assignments = await prisma.assignment.findMany({
    where: {
      courseId: { in: courseIds },
      dueDate: { gte: new Date() },
    },
    orderBy: { dueDate: "asc" },
    include: {
      course: {
        select: {
          courseId: true,
          courseName: true,
          courseCode: true,
        },
      },
      _count: {
        select: { submissions: true },
      },
    },
  });

  return assignments;
};

module.exports = {
  createAssignment,
  getAssignmentsByCourse,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  getUpcomingAssignments,
};
