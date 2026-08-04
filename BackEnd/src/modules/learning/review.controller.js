const catchAsync = require('../../utils/catchAsync');
const reviewService = require('./review.service');
const { success, error, paginated } = require('../../utils/responseHelper');

const createReview = catchAsync(async (request, response) => {
    const review = await reviewService.createReview(request.user.userId, request.params.courseId, request.body);
    return success(response, review, 'Review created successfully', 201);
});

const getCourseReviews = catchAsync(async (request, response) => {
    const { reviews, pagination } = await reviewService.getReviewsByCourse(request.params.courseId, request.query);
    return paginated(response, reviews, pagination, 'Course reviews retrieved');
});

const updateReview = catchAsync(async (request, response) => {
    const review = await reviewService.updateReview(request.params.id, request.user.userId, request.body);
    return success(response, review, 'Review updated successfully');
});

const deleteReview = catchAsync(async (request, response) => {
    const result = await reviewService.deleteReview(request.params.id, request.user.userId, request.user.role);
    return success(response, result, 'Review deleted successfully');
});

const getCourseRating = catchAsync(async (request, response) => {
    const rating = await reviewService.getCourseRating(request.params.courseId);
    return success(response, rating, 'Course rating retrieved');
});

module.exports = {
    createReview,
    getCourseReviews,
    updateReview,
    deleteReview,
    getCourseRating,
};
