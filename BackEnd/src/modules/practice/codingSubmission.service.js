const prisma = require('../../config/prisma');
const { getPaginationMeta } = require('../../utils/pagination');
const { executeCode } = require('./codeExecution.service');
const { parseId, failure } = require('./practiceValidation');
const validateExecution = (problem, language, code) => {
    if (typeof code !== 'string' || !code.trim()) throw failure('Code cannot be empty');
    if (typeof language !== 'string' || !language.trim()) throw failure('Language is required');
    const supported = problem.supportedLanguages
        ? JSON.parse(problem.supportedLanguages)
        : ['javascript', 'python', 'java', 'cpp'];
    if (!supported.includes(language)) throw failure(`Language '${language}' is not supported for this problem. Supported: ${supported.join(', ')}`);
};
const visibleOutput = output => {
    if (!output) return output;
    const results = JSON.parse(output);
    return JSON.stringify(results.map(result => result.isHidden ? { testCaseId: result.testCaseId, passed: result.passed, isHidden: true, executionTime: result.executionTime, memoryUsed: result.memoryUsed } : result));
};

/**
 * Submit code for a problem - runs against ALL test cases and saves the result
 */
const submitCode = async (studentId, problemId, language, code) => {
    const id = parseId(problemId);

    const problem = await prisma.codingProblem.findUnique({
        where: { problemId: id },
        include: { testCases: { orderBy: { orderIndex: 'asc' } } },
    });

    if (!problem) {
        throw failure('Problem not found', 404);
    }

    if (!problem.isActive) {
        throw failure('This problem is no longer available');
    }

    if (problem.testCases.length === 0) {
        throw failure('No test cases defined for this problem');
    }

    validateExecution(problem, language, code);

    // Execute code against ALL test cases
    const executionResult = await executeCode(code, language, problem.testCases);

    // Save submission to database
    const submission = await prisma.codingSubmission.create({
        data: {
            problemId: id,
            studentId,
            language,
            code,
            status: executionResult.status,
            executionTime: executionResult.executionTime,
            memoryUsed: executionResult.memoryUsed,
            testCasesPassed: executionResult.testCasesPassed,
            totalTestCases: executionResult.totalTestCases,
            output: JSON.stringify(executionResult.results),
            errorMessage: executionResult.errorMessage,
        },
        include: {
            problem: {
                select: { problemId: true, title: true, slug: true, difficulty: true },
            },
        },
    });

    // Filter hidden test case details from the response for students
    const visibleResults = executionResult.results.map((r) => {
        if (r.isHidden) {
            return {
                testCaseId: r.testCaseId,
                passed: r.passed,
                isHidden: true,
                executionTime: r.executionTime,
                memoryUsed: r.memoryUsed,
            };
        }
        return r;
    });

    return {
        submission: { ...submission, output: visibleOutput(submission.output) },
        executionResult: {
            ...executionResult,
            results: visibleResults,
        },
    };
};

/**
 * Run code against sample (non-hidden) test cases only - does NOT save
 */
const runCode = async (studentId, problemId, language, code) => {
    const id = parseId(problemId);

    const problem = await prisma.codingProblem.findUnique({
        where: { problemId: id },
        include: {
            testCases: {
                where: { isHidden: false },
                orderBy: { orderIndex: 'asc' },
            },
        },
    });

    if (!problem) {
        throw failure('Problem not found', 404);
    }

    if (!problem.isActive) {
        throw failure('This problem is no longer available');
    }

    if (problem.testCases.length === 0) {
        throw failure('No sample test cases available');
    }

    validateExecution(problem, language, code);

    // Execute against sample test cases only
    const executionResult = await executeCode(code, language, problem.testCases);

    return executionResult;
};

/**
 * Get a student's submissions for a specific problem
 */
const getSubmissionsByProblem = async (problemId, studentId, pagination = {}) => {
    const id = parseInt(problemId);
    const { skip, take, page, limit } = pagination;

    const where = {
        problemId: id,
        studentId,
    };

    const [submissions, total] = await Promise.all([
        prisma.codingSubmission.findMany({
            where,
            skip,
            take,
            orderBy: { submittedAt: 'desc' },
            select: {
                submissionId: true,
                language: true,
                status: true,
                executionTime: true,
                memoryUsed: true,
                testCasesPassed: true,
                totalTestCases: true,
                submittedAt: true,
            },
        }),
        prisma.codingSubmission.count({ where }),
    ]);

    const paginationMeta = getPaginationMeta(total, page, limit);

    return { submissions, pagination: paginationMeta };
};

/**
 * Get full submission details by ID
 */
const getSubmissionById = async (submissionId) => {
    const id = parseInt(submissionId);

    const submission = await prisma.codingSubmission.findUnique({
        where: { submissionId: id },
        include: {
            problem: {
                select: { problemId: true, title: true, slug: true, difficulty: true },
            },
            student: {
                select: { userId: true, userName: true, fullName: true },
            },
        },
    });

    if (!submission) {
        throw Object.assign(new Error('Submission not found'), { statusCode: 404 });
    }

    return submission;
};

/**
 * Get leaderboard for a problem - fastest accepted solutions
 */
const getLeaderboard = async (problemId) => {
    const id = parseId(problemId);

    const problem = await prisma.codingProblem.findUnique({ where: { problemId: id } });
    if (!problem) {
        throw failure('Problem not found', 404);
    }

    // Get the best (fastest) accepted submission per student
    const submissions = await prisma.codingSubmission.findMany({
        where: {
            problemId: id,
            status: 'accepted',
        },
        orderBy: [
            { executionTime: 'asc' },
            { memoryUsed: 'asc' },
        ],
        include: {
            student: {
                select: { userId: true, userName: true, fullName: true, profileUrl: true },
            },
        },
    });

    // Keep only the best submission per student
    const seenStudents = new Set();
    const leaderboard = [];

    for (const sub of submissions) {
        if (!seenStudents.has(sub.studentId)) {
            seenStudents.add(sub.studentId);
            leaderboard.push({
                rank: leaderboard.length + 1,
                student: sub.student,
                language: sub.language,
                executionTime: sub.executionTime,
                memoryUsed: sub.memoryUsed,
                submittedAt: sub.submittedAt,
            });
        }
    }

    return leaderboard;
};

/**
 * Get aggregated coding stats for a user
 */
const getUserStats = async (userId) => {
    // Get all accepted submissions (distinct problems)
    const acceptedSubmissions = await prisma.codingSubmission.findMany({
        where: {
            studentId: userId,
            status: 'accepted',
        },
        select: {
            problemId: true,
            problem: {
                select: { difficulty: true },
            },
        },
        distinct: ['problemId'],
    });

    const totalSolved = acceptedSubmissions.length;
    const easySolved = acceptedSubmissions.filter((s) => s.problem.difficulty === 'easy').length;
    const mediumSolved = acceptedSubmissions.filter((s) => s.problem.difficulty === 'medium').length;
    const hardSolved = acceptedSubmissions.filter((s) => s.problem.difficulty === 'hard').length;

    // Total submissions count
    const totalSubmissions = await prisma.codingSubmission.count({
        where: { studentId: userId },
    });

    // Total accepted count (including re-submissions)
    const totalAccepted = await prisma.codingSubmission.count({
        where: { studentId: userId, status: 'accepted' },
    });

    // Recent submissions
    const recentSubmissions = await prisma.codingSubmission.findMany({
        where: { studentId: userId },
        orderBy: { submittedAt: 'desc' },
        take: 10,
        select: {
            submissionId: true,
            language: true,
            status: true,
            executionTime: true,
            submittedAt: true,
            problem: {
                select: { problemId: true, title: true, slug: true, difficulty: true },
            },
        },
    });

    // Total problems available
    const totalProblems = await prisma.codingProblem.count({
        where: { isActive: true },
    });

    return {
        totalSolved,
        totalProblems,
        easySolved,
        mediumSolved,
        hardSolved,
        totalSubmissions,
        totalAccepted,
        acceptanceRate: totalSubmissions > 0
            ? parseFloat(((totalAccepted / totalSubmissions) * 100).toFixed(1))
            : 0,
        recentSubmissions,
    };
};

module.exports = {
    visibleOutput,
    submitCode,
    runCode,
    getSubmissionsByProblem,
    getSubmissionById,
    getLeaderboard,
    getUserStats,
};
