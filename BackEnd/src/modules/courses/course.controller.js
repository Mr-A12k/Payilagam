const catchAsync = require('../../utils/catchAsync');
const courseService = require('./course.service');
const { success, error, paginated } = require('../../utils/responseHelper');

const create = catchAsync(async (request, response) => {
    if (request.file) {
        request.body.thumbnail = `/uploads/${request.file.filename}`;
    }
    
    // Convert strings from FormData back to numbers
    if (request.body.price) request.body.price = parseFloat(request.body.price);
    if (request.body.duration) request.body.duration = parseInt(request.body.duration, 10);
    if (request.body.categoryId) request.body.categoryId = parseInt(request.body.categoryId, 10);

    const course = await courseService.createCourse(request.user.userId, request.body);
    return success(response, course, 'Course created successfully', 201);
});

const getAll = catchAsync(async (request, response) => {
    const { courses, pagination } = await courseService.getAllCourses(request.query);
    return paginated(response, courses, pagination, 'Courses retrieved successfully');
});

const getById = catchAsync(async (request, response) => {
    const identifier = request.params.uniqueId;
    if (!identifier) {
        return error(response, 'Invalid course identifier', 400);
    }
    const course = await courseService.getCourseById(identifier);
    return success(response, course, 'Course retrieved successfully');
});

const update = catchAsync(async (request, response) => {
    const identifier = request.params.uniqueId;
    if (!identifier) {
        return error(response, 'Invalid course identifier', 400);
    }
    // Admin can update any course; mentor can only update own courses
    const mentorId = request.user.role === 'admin' ? null : request.user.userId;
    if (request.file) {
        request.body.thumbnail = `/uploads/${request.file.filename}`;
    }
    
    // Convert strings from FormData back to numbers
    if (request.body.price !== undefined) request.body.price = parseFloat(request.body.price);
    if (request.body.duration !== undefined) request.body.duration = parseInt(request.body.duration, 10);
    if (request.body.categoryId !== undefined) request.body.categoryId = parseInt(request.body.categoryId, 10);

    const course = await courseService.updateCourse(identifier, mentorId, request.body);
    return success(response, course, 'Course updated successfully');
});

const remove = catchAsync(async (request, response) => {
    const identifier = request.params.uniqueId;
    if (!identifier) {
        return error(response, 'Invalid course identifier', 400);
    }
    const result = await courseService.deleteCourse(identifier, request.user.userId, request.user.role);
    return success(response, result, 'Course deleted successfully');
});

const requestDeletion = catchAsync(async (request, response) => {
    const identifier = request.params.uniqueId;
    const result = await courseService.requestCourseDeletion(identifier, request.user.userId);
    return success(response, result, 'Deletion request sent to Admin');
});

const getMyCourses = catchAsync(async (request, response) => {
    const { courses, pagination } = await courseService.getMentorCourses(request.user.userId, request.query);
    return paginated(response, courses, pagination, 'Your courses retrieved successfully');
});

const getPublished = catchAsync(async (request, response) => {
    const { courses, pagination } = await courseService.getPublishedCourses(request.query);
    return paginated(response, courses, pagination, 'Published courses retrieved successfully');
});

const getMentorStats = catchAsync(async (request, response) => {
    const stats = await courseService.getMentorStats(request.user.userId);
    return success(response, stats, 'Mentor stats retrieved successfully');
});

module.exports = {
    create,
    getAll,
    getById,
    update,
    remove,
    requestDeletion,
    getMyCourses,
    getPublished,
    getMentorStats,
};
