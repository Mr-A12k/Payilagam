const catchAsync = require('../../utils/catchAsync');
const codingSubmissionService = require('./codingSubmission.service');
const { success, error, paginated } = require('../../utils/responseHelper');
const { getPaginationParams } = require('../../utils/pagination');
const { parseId, failure } = require('./practiceValidation');

const runCode = catchAsync(async (request, response) => {
    parseId(request.params.problemId);
    if (typeof request.body.code !== 'string' || !request.body.code.trim()) throw failure('Code cannot be empty', 400);
    if (typeof request.body.language !== 'string' || !request.body.language.trim()) throw failure('Language is required', 400);
    const { language, code } = request.body;
    const result = await codingSubmissionService.runCode(
        request.user.userId,
        request.params.problemId,
        language,
        code
    );
    return success(response, result, 'Code executed successfully');
});

const submitCode = catchAsync(async (request, response) => {
    parseId(request.params.problemId);
    if (typeof request.body.code !== 'string' || !request.body.code.trim()) throw failure('Code cannot be empty', 400);
    if (typeof request.body.language !== 'string' || !request.body.language.trim()) throw failure('Language is required', 400);
    const { language, code } = request.body;
    const result = await codingSubmissionService.submitCode(
        request.user.userId,
        request.params.problemId,
        language,
        code
    );
    return success(response, result, 'Code submitted successfully', 201);
});

const getMySubmissions = catchAsync(async (request, response) => {
    parseId(request.params.problemId);
    const pagination = getPaginationParams(request.query);
    const result = await codingSubmissionService.getSubmissionsByProblem(
        request.params.problemId,
        request.user.userId,
        pagination
    );
    return paginated(response, result.submissions, result.pagination, 'Submissions retrieved successfully');
});

const getSubmissionById = catchAsync(async (request, response) => {
    parseId(request.params.id);
    const submission = await codingSubmissionService.getSubmissionById(request.params.id);
    if (request.user.role !== 'admin' && submission.studentId !== request.user.userId) throw failure('Submission access denied', 403);
    if (request.user.role !== 'admin') submission.output = codingSubmissionService.visibleOutput(submission.output);
    return success(response, submission, 'Submission retrieved successfully');
});

const getLeaderboard = catchAsync(async (request, response) => {
    parseId(request.params.problemId);
    const leaderboard = await codingSubmissionService.getLeaderboard(request.params.problemId);
    return success(response, leaderboard, 'Leaderboard retrieved successfully');
});

const getMyStats = catchAsync(async (request, response) => {
    const stats = await codingSubmissionService.getUserStats(request.user.userId);
    return success(response, stats, 'Stats retrieved successfully');
});

module.exports = {
    runCode,
    submitCode,
    getMySubmissions,
    getSubmissionById,
    getLeaderboard,
    getMyStats,
};
