const catchAsync = require('../../utils/catchAsync');
const progressService = require('./progress.service');
const { success, error } = require('../../utils/responseHelper');

const markLessonComplete = catchAsync(async (request, response) => {
    const result = await progressService.markLessonComplete(request.user.userId, request.params.lessonId);
    return success(response, result, 'Lesson marked as complete');
});

const markLessonIncomplete = catchAsync(async (request, response) => {
    const result = await progressService.markLessonIncomplete(request.user.userId, request.params.lessonId);
    return success(response, result, 'Lesson marked as incomplete');
});

const updateWatchTime = catchAsync(async (request, response) => {
    const { watchTime } = request.body;

    if (watchTime === undefined || watchTime === null || isNaN(watchTime)) {
        return error(response, 'watchTime is required and must be a number', 400);
    }

    const result = await progressService.updateWatchTime(request.user.userId, request.params.lessonId, watchTime);
    return success(response, result, 'Watch time updated');
});

const getCourseProgress = catchAsync(async (request, response) => {
    const result = await progressService.getCourseProgress(request.user.userId, request.params.courseId);
    return success(response, result, 'Course progress retrieved');
});

const getStudentDashboard = catchAsync(async (request, response) => {
    const dashboard = await progressService.getStudentDashboard(request.user.userId);
    return success(response, dashboard, 'Dashboard retrieved');
});

module.exports = {
    markLessonComplete,
    markLessonIncomplete,
    updateWatchTime,
    getCourseProgress,
    getStudentDashboard,
};
