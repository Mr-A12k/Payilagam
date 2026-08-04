const catchAsync = require('../../utils/catchAsync');
const enrollmentService = require('./enrollment.service');
const { success, error, paginated } = require('../../utils/responseHelper');

const enroll = catchAsync(async (request, response) => {
    const enrollment = await enrollmentService.enrollStudent(request.user.userId, request.params.courseId);
    return success(response, enrollment, 'Enrolled successfully', 201);
});

const unenroll = catchAsync(async (request, response) => {
    const result = await enrollmentService.unenrollStudent(request.user.userId, request.params.courseId);
    return success(response, result, 'Unenrolled successfully');
});

const getMyEnrollments = catchAsync(async (request, response) => {
    const { enrollments, pagination } = await enrollmentService.getStudentEnrollments(request.user.userId, request.query);
    return paginated(response, enrollments, pagination, 'Enrollments retrieved');
});

const getCourseEnrollments = catchAsync(async (request, response) => {
    const { enrollments, pagination } = await enrollmentService.getCourseEnrollments(request.params.courseId, request.query);
    return paginated(response, enrollments, pagination, 'Course enrollments retrieved');
});

const checkEnrollment = catchAsync(async (request, response) => {
    const result = await enrollmentService.checkEnrollment(request.user.userId, request.params.courseId);
    return success(response, result, 'Enrollment status retrieved');
});

const getEnrollmentStats = catchAsync(async (request, response) => {
    const stats = await enrollmentService.getEnrollmentStats(request.params.courseId);
    return success(response, stats, 'Enrollment stats retrieved');
});

module.exports = {
    enroll,
    unenroll,
    getMyEnrollments,
    getCourseEnrollments,
    checkEnrollment,
    getEnrollmentStats,
};
