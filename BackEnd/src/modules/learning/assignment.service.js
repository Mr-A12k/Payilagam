const prisma = require("../../config/prisma");
const { validateQuiz, quizMarks, publicAssignment } = require('./quiz');
const { integer, text, fail, services } = require('./validation');
const validateAssignment = (data, creating = false) => {
  text(data.title, 'title', creating || data.title !== undefined);
  text(data.description, 'description');
  if (creating) integer(data.courseId, 'courseId');
  if (data.totalMarks !== undefined) integer(data.totalMarks, 'totalMarks');
  if (data.problemId != null) integer(data.problemId, 'problemId');
  if (data.type !== undefined && !['file_upload', 'coding_challenge', 'quiz', 'text'].includes(data.type)) fail('Invalid assignment type');
  if (data.dueDate != null && (typeof data.dueDate !== 'string' || !Number.isFinite(Date.parse(data.dueDate)))) fail('Invalid dueDate');
};
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
  validateAssignment(data, true);
  const { title, description, courseId, type, dueDate, totalMarks, problemId } =
    data;

  await verifyMentorOwnership(courseId, mentorId, role);
  const quiz = type === 'quiz' ? validateQuiz(data.quiz) : undefined;
  if (type !== 'quiz' && data.quiz != null) fail('Questions require a quiz assignment');

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
      totalMarks: quiz ? quizMarks(quiz) : totalMarks || 100,
      ...(quiz && { quiz }),
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
const getAssignmentsByCourse = async (courseId, query, user) => {
  const course = await prisma.course.findUnique({ where: { courseId: Number(courseId) } });
  if (!course) fail('Course not found', 404);
  const canManage = user?.role === 'admin' || user?.userId === course.mentorId;
  const { page, limit, skip, take } = getPaginationParams(query);
  const orderBy = getSortParams(
    query,
    ["createdAt", "dueDate", "title"],
    "createdAt",
    "desc",
  );

  const where = { courseId: parseInt(courseId), ...(query.type === 'quiz' && { type: 'quiz' }) };

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
  return { assignments: assignments.map(assignment => publicAssignment(assignment, canManage)), pagination };
};

/**
 * Get a single assignment by ID with submission count.
 */
const getAssignmentById = async (assignmentId, user) => {
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

  return publicAssignment(assignment, user?.role === 'admin' || user?.userId === assignment.course.mentorId);
};

/**
 * Update an assignment. Mentor must own the course.
 */
const updateAssignment = async (assignmentId, mentorId, role, data) => {
  validateAssignment(data);
  if (data.problemId != null && !await prisma.codingProblem.findUnique({ where: { problemId: data.problemId } })) fail('Coding problem not found', 404);
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
  const nextType = type ?? assignment.type;
  const quiz = nextType === 'quiz' ? validateQuiz(data.quiz ?? assignment.quiz) : undefined;
  if (nextType !== 'quiz' && data.quiz != null) fail('Questions require a quiz assignment');
  if ((assignment.type === 'quiz' || nextType === 'quiz') &&
      (nextType !== assignment.type || JSON.stringify(quiz) !== JSON.stringify(assignment.quiz)) &&
      await prisma.assignmentSubmission.count({ where: { assignmentId: assignment.assignmentId } })) {
    fail('Questions cannot change after students submit. Create a new quiz instead.', 409);
  }

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
      ...(quiz && { quiz, totalMarks: quizMarks(quiz) }),
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
      OR: [{ dueDate: { gte: new Date() } }, { type: 'quiz', dueDate: null }],
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

  return assignments.map(assignment => publicAssignment(assignment));
};

module.exports = services({
  createAssignment,
  getAssignmentsByCourse,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  getUpcomingAssignments,
});
