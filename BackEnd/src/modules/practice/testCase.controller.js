const catchAsync = require('../../utils/catchAsync');
const testCaseService = require('./testCase.service');
const { success, error } = require('../../utils/responseHelper');

const getTestCases = catchAsync(async (request, response) => {
    // Mentors/admins see all test cases including hidden
    const testCases = await testCaseService.getTestCases(request.params.problemId, true);
    return success(response, testCases, 'Test cases retrieved successfully');
});

const addTestCase = catchAsync(async (request, response) => {
    const testCase = await testCaseService.addTestCase(request.params.problemId, request.body);
    return success(response, testCase, 'Test case added successfully', 201);
});

const bulkAddTestCases = catchAsync(async (request, response) => {
    const result = await testCaseService.bulkAddTestCases(request.params.problemId, request.body.testCases);
    return success(response, result, 'Test cases added successfully', 201);
});

const updateTestCase = catchAsync(async (request, response) => {
    const testCase = await testCaseService.updateTestCase(request.params.id, request.body);
    return success(response, testCase, 'Test case updated successfully');
});

const deleteTestCase = catchAsync(async (request, response) => {
    await testCaseService.deleteTestCase(request.params.id);
    return success(response, null, 'Test case deleted successfully');
});

module.exports = {
    getTestCases,
    addTestCase,
    bulkAddTestCases,
    updateTestCase,
    deleteTestCase,
};
