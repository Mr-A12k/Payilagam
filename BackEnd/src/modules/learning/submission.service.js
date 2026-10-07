const prisma = require('../../config/prisma');
const { gradeQuiz } = require('./quiz');
const { integer, text, fail, services } = require('./validation');
const { getPaginationParams, getPaginationMeta, getSortParams } = require('../../utils/pagination');

/**
 * Submit an assignment.
 * Student must be enrolled in the course. Checks due date.
 */
const submitAssignment = async (studentId, assignmentId, data) => {
    const assignment = await prisma.assignment.findUnique({
        where: { assignmentId: parseInt(assignmentId) },
        include: { course: true },
    });

    if (!assignment) {
        throw new Error('Assignment not found');
    }

    // Check student is enrolled in the course
    const enrollment = await prisma.enrollment.findUnique({
        where: {
            studentId_courseId: {
                studentId,
                courseId: assignment.courseId,
            },
        },
    });

    if (!enrollment || enrollment.status !== 'active') {
        throw new Error('You are not enrolled in this course');
    }

    // Check due date
    if (assignment.dueDate && new Date() > new Date(assignment.dueDate)) {
        throw new Error('The due date for this assignment has passed');
    }

    const { submissionFile, submissionText, code, language } = data;
    for (const key of ['submissionFile', 'submissionText', 'code', 'language']) text(data[key], key);
    const quizResult = assignment.type === 'quiz' ? gradeQuiz(assignment.quiz, data.answers) : null;
    if (!quizResult && ![submissionFile, submissionText, code].some(value => typeof value === 'string' && value.trim())) fail('Submission content is required');
    if (assignment.type === 'coding_challenge' && (!code?.trim() || !language?.trim())) fail('Code and language are required');

    const submission = await prisma.assignmentSubmission.create({
        data: {
            assignmentId: parseInt(assignmentId),
            studentId,
            submissionFile: submissionFile || null,
            submissionText: submissionText || null,
            code: code || null,
            language: language || null,
            ...(quizResult && { ...quizResult, submissionFile: null, code: null, language: null }),
        },
        include: {
            assignment: {
                select: {
                    assignmentId: true,
                    title: true,
                    type: true,
                    totalMarks: true,
                    dueDate: true,
                },
            },
            student: {
                select: {
                    userId: true,
                    fullName: true,
                    userName: true,
                },
            },
        },
    });

    return submission;
};

/**
 * Get all submissions for an assignment (mentor/admin view) - paginated.
 */
const getSubmissionsByAssignment = async (assignmentId, query, user) => {
    const assignment = await prisma.assignment.findUnique({ where: { assignmentId: Number(assignmentId) }, include: { course: true } });
    if (!assignment) fail('Assignment not found', 404);
    if (!user || user.role !== 'admin' && assignment.course.mentorId !== user.userId) fail('Not authorized to view submissions', 403);
    const { page, limit, skip, take } = getPaginationParams(query);
    const orderBy = getSortParams(query, ['submittedAt', 'marks', 'status'], 'submittedAt', 'desc');

    const where = { assignmentId: parseInt(assignmentId) };

    const [submissions, total] = await Promise.all([
        prisma.assignmentSubmission.findMany({
            where,
            skip,
            take,
            orderBy,
            include: {
                student: {
                    select: {
                        userId: true,
                        fullName: true,
                        userName: true,
                        email: true,
                    },
                },
                assignment: {
                    select: {
                        assignmentId: true,
                        title: true,
                        totalMarks: true,
                    },
                },
            },
        }),
        prisma.assignmentSubmission.count({ where }),
    ]);

    const pagination = getPaginationMeta(total, page, limit);
    return { submissions, pagination };
};

/**
 * Get a student's submissions for a specific assignment.
 */
const getStudentSubmissions = async (studentId, assignmentId) => {
    const submissions = await prisma.assignmentSubmission.findMany({
        where: {
            studentId,
            assignmentId: parseInt(assignmentId),
        },
        orderBy: { submittedAt: 'desc' },
        include: {
            assignment: {
                select: {
                    assignmentId: true,
                    title: true,
                    type: true,
                    totalMarks: true,
                    dueDate: true,
                },
            },
        },
    });

    return submissions;
};

/**
 * Get all of a student's submissions across all assignments - paginated.
 */
const getMySubmissions = async (studentId, query) => {
    const { page, limit, skip, take } = getPaginationParams(query);
    const orderBy = getSortParams(query, ['submittedAt', 'marks', 'status'], 'submittedAt', 'desc');

    const where = { studentId };

    const [submissions, total] = await Promise.all([
        prisma.assignmentSubmission.findMany({
            where,
            skip,
            take,
            orderBy,
            include: {
                assignment: {
                    select: {
                        assignmentId: true,
                        title: true,
                        type: true,
                        totalMarks: true,
                        dueDate: true,
                        course: {
                            select: {
                                courseId: true,
                                courseName: true,
                                courseCode: true,
                            },
                        },
                    },
                },
            },
        }),
        prisma.assignmentSubmission.count({ where }),
    ]);

    const pagination = getPaginationMeta(total, page, limit);
    return { submissions, pagination };
};

/**
 * Grade a submission. Mentor must own the course the assignment belongs to.
 */
const gradeSubmission = async (submissionId, mentorId, role, data) => {
    const submission = await prisma.assignmentSubmission.findUnique({
        where: { submissionId: parseInt(submissionId) },
        include: {
            assignment: {
                include: { course: true },
            },
        },
    });

    if (!submission) {
        throw new Error('Submission not found');
    }

    // Verify mentor owns the course
    if (role !== 'admin' && submission.assignment.course.mentorId !== mentorId) {
        throw new Error('You are not authorized to grade this submission');
    }

    const { marks, feedback, status } = data;
    if (marks !== undefined) integer(marks, 'marks', 0);
    text(feedback, 'feedback');
    if (status !== undefined && !['submitted', 'reviewed', 'graded', 'returned'].includes(status)) fail('Invalid submission status');

    // Validate marks against totalMarks
    if (marks !== undefined && marks > submission.assignment.totalMarks) {
        throw new Error(`Marks cannot exceed total marks (${submission.assignment.totalMarks})`);
    }

    const updated = await prisma.assignmentSubmission.update({
        where: { submissionId: parseInt(submissionId) },
        data: {
            ...(marks !== undefined && { marks }),
            ...(feedback !== undefined && { feedback }),
            ...(status !== undefined && { status }),
        },
        include: {
            assignment: {
                select: {
                    assignmentId: true,
                    title: true,
                    totalMarks: true,
                },
            },
            student: {
                select: {
                    userId: true,
                    fullName: true,
                    userName: true,
                    email: true,
                },
            },
        },
    });

    return updated;
};

/**
 * Get a single submission by ID with full details.
 */
const getSubmissionById = async (submissionId, user) => {
    const submission = await prisma.assignmentSubmission.findUnique({
        where: { submissionId: parseInt(submissionId) },
        include: {
            assignment: {
                select: {
                    assignmentId: true,
                    title: true,
                    type: true,
                    totalMarks: true,
                    dueDate: true,
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
            student: {
                select: {
                    userId: true,
                    fullName: true,
                    userName: true,
                    email: true,
                },
            },
        },
    });

    if (!submission) {
        throw new Error('Submission not found');
    }

    if (!user || user.role !== 'admin' && submission.studentId !== user.userId && submission.assignment.course.mentorId !== user.userId) fail('Not authorized to view this submission', 403);
    return submission;
};

module.exports = services({
    submitAssignment,
    getSubmissionsByAssignment,
    getStudentSubmissions,
    getMySubmissions,
    gradeSubmission,
    getSubmissionById,
});
