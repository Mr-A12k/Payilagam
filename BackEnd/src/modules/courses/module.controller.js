const catchAsync = require('../../utils/catchAsync');
const moduleService = require('./module.service');
const { success, error } = require('../../utils/responseHelper');

const createModule = catchAsync(async (request, response) => {
    const identifier = request.params.courseId;
    const module = await moduleService.createModule(identifier, request.user.userId, request.body, request.user.role);
    return success(response, module, 'Module created successfully', 201);
});

const getModulesByCourse = catchAsync(async (request, response) => {
    const identifier = request.params.courseId;
    const modules = await moduleService.getModulesByCourse(identifier);
    return success(response, modules, 'Modules retrieved successfully');
});

const getModuleById = catchAsync(async (request, response) => {
    const moduleId = parseInt(request.params.id);
    const module = await moduleService.getModuleById(moduleId);
    return success(response, module, 'Module retrieved successfully');
});

const updateModule = catchAsync(async (request, response) => {
    const moduleId = parseInt(request.params.id);
    const module = await moduleService.updateModule(moduleId, request.user.userId, request.body, request.user.role);
    return success(response, module, 'Module updated successfully');
});

const deleteModule = catchAsync(async (request, response) => {
    const moduleId = parseInt(request.params.id);
    const result = await moduleService.deleteModule(moduleId, request.user.userId, request.user.role);
    return success(response, result, 'Module deleted successfully');
});

const reorderModules = catchAsync(async (request, response) => {
    const identifier = request.params.courseId;
    const { moduleOrders } = request.body;
    const modules = await moduleService.reorderModules(identifier, request.user.userId, moduleOrders, request.user.role);
    return success(response, modules, 'Modules reordered successfully');
});

module.exports = {
    createModule,
    getModulesByCourse,
    getModuleById,
    updateModule,
    deleteModule,
    reorderModules,
};
