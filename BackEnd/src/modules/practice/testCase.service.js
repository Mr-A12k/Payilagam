const prisma = require('../../config/prisma');

/**
 * Add a single test case to a problem
 */
const addTestCase = async (problemId, data) => {
    const id = parseInt(problemId);

    const problem = await prisma.codingProblem.findUnique({ where: { problemId: id } });
    if (!problem) {
        throw new Error('Problem not found');
    }

    const { input, expectedOutput, isHidden, orderIndex } = data;

    if (typeof input !== 'string' || typeof expectedOutput !== 'string') {
        throw new Error('Input and expected output are required');
    }

    const testCase = await prisma.testCase.create({
        data: {
            problemId: id,
            input,
            expectedOutput,
            isHidden: isHidden || false,
            orderIndex: orderIndex || 0,
        },
    });

    return testCase;
};

/**
 * Get test cases for a problem
 * If includeHidden is false, only non-hidden test cases are returned
 */
const getTestCases = async (problemId, includeHidden = true) => {
    const id = parseInt(problemId);

    const problem = await prisma.codingProblem.findUnique({ where: { problemId: id } });
    if (!problem) {
        throw new Error('Problem not found');
    }

    const where = { problemId: id };
    if (!includeHidden) {
        where.isHidden = false;
    }

    const testCases = await prisma.testCase.findMany({
        where,
        orderBy: { orderIndex: 'asc' },
    });

    return testCases;
};

/**
 * Update a test case
 */
const updateTestCase = async (testCaseId, data) => {
    const id = parseInt(testCaseId);

    const existing = await prisma.testCase.findUnique({ where: { testCaseId: id } });
    if (!existing) {
        throw new Error('Test case not found');
    }

    const { input, expectedOutput, isHidden, orderIndex } = data;

    const updateData = {};
    if (input !== undefined) updateData.input = input;
    if (expectedOutput !== undefined) updateData.expectedOutput = expectedOutput;
    if (isHidden !== undefined) updateData.isHidden = isHidden;
    if (orderIndex !== undefined) updateData.orderIndex = orderIndex;

    const testCase = await prisma.testCase.update({
        where: { testCaseId: id },
        data: updateData,
    });

    return testCase;
};

/**
 * Delete a test case
 */
const deleteTestCase = async (testCaseId) => {
    const id = parseInt(testCaseId);

    const existing = await prisma.testCase.findUnique({ where: { testCaseId: id } });
    if (!existing) {
        throw new Error('Test case not found');
    }

    await prisma.testCase.delete({ where: { testCaseId: id } });

    return { message: 'Test case deleted successfully' };
};

/**
 * Bulk add test cases to a problem
 */
const bulkAddTestCases = async (problemId, testCases) => {
    const id = parseInt(problemId);

    const problem = await prisma.codingProblem.findUnique({ where: { problemId: id } });
    if (!problem) {
        throw new Error('Problem not found');
    }

    if (!Array.isArray(testCases) || testCases.length === 0) {
        throw new Error('Test cases array is required and must not be empty');
    }

    const data = testCases.map((tc, index) => ({
        problemId: id,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        isHidden: tc.isHidden || false,
        orderIndex: tc.orderIndex !== undefined ? tc.orderIndex : index,
    }));

    const result = await prisma.testCase.createMany({
        data,
    });

    // Return the newly created test cases
    const createdTestCases = await prisma.testCase.findMany({
        where: { problemId: id },
        orderBy: { orderIndex: 'asc' },
    });

    return { count: result.count, testCases: createdTestCases };
};

module.exports = {
    addTestCase,
    getTestCases,
    updateTestCase,
    deleteTestCase,
    bulkAddTestCases,
};
