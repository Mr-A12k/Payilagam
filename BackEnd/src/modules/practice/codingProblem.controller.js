const catchAsync = require('../../utils/catchAsync');
const codingProblemService = require('./codingProblem.service');
const { success, error, paginated } = require('../../utils/responseHelper');
const { getPaginationParams } = require('../../utils/pagination');

const create = catchAsync(async (request, response) => {
    const problem = await codingProblemService.createProblem(request.user.userId, request.body);
    return success(response, problem, 'Problem created successfully', 201);
});

const getAll = catchAsync(async (request, response) => {
    const filters = {
        difficulty: request.query.difficulty,
        tag: request.query.tag,
        search: request.query.search,
        isActive: request.query.isActive !== undefined
            ? request.query.isActive === 'true'
            : undefined,
    };

    const pagination = getPaginationParams(request.query);
    const result = await codingProblemService.getAllProblems(filters, pagination);
    return paginated(response, result.problems, result.pagination, 'Problems retrieved successfully');
});

const getById = catchAsync(async (request, response) => {
    const problem = await codingProblemService.getProblemById(request.params.id, request.user.role);
    return success(response, problem, 'Problem retrieved successfully');
});

const getBySlug = catchAsync(async (request, response) => {
    const problem = await codingProblemService.getProblemBySlug(request.params.slug, request.user.role);
    return success(response, problem, 'Problem retrieved successfully');
});

const update = catchAsync(async (request, response) => {
    const problem = await codingProblemService.updateProblem(request.params.id, request.body);
    return success(response, problem, 'Problem updated successfully');
});

const remove = catchAsync(async (request, response) => {
    await codingProblemService.deleteProblem(request.params.id);
    return success(response, null, 'Problem deleted successfully');
});

const getStats = catchAsync(async (request, response) => {
    const stats = await codingProblemService.getProblemStats(request.params.id);
    return success(response, stats, 'Problem stats retrieved successfully');
});

module.exports = {
    create,
    getAll,
    getById,
    getBySlug,
    update,
    remove,
    getStats,
};
