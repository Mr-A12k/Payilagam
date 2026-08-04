const userService = require('./user.service');
const catchAsync = require('../../utils/catchAsync');
const { success, error } = require('../../utils/responseHelper');

const getMentors = catchAsync(async (request, response) => {
    const mentors = await userService.getMentors();
    return success(response, mentors, 'Mentors retrieved successfully');
});

const getMentorDetails = catchAsync(async (request, response) => {
    const currentUserId = request.user?.userId; // Might be undefined if not logged in, depending on middleware
    const { id } = request.params;
    
    try {
        const details = await userService.getMentorDetails(id, currentUserId);
        return success(response, details, 'Mentor details retrieved successfully');
    } catch (error) {
        return error(response, error.message, 404);
    }
});

const getActivity = catchAsync(async (request, response) => {
    const userId = request.user?.userId;
    if (!userId) {
        return error(response, 'Unauthorized', 401);
    }
    const days = request.query.days ? parseInt(request.query.days) : 365;
    const activityMap = await userService.getActivity(userId, days);
    return success(response, activityMap, 'Activity retrieved successfully');
});

const searchUsers = catchAsync(async (request, response) => {
    const userId = request.user?.userId;
    if (!userId) {
        return error(response, 'Unauthorized', 401);
    }
    const { q } = request.query;
    const users = await userService.searchUsers(q, userId);
    return success(response, users, 'Users retrieved successfully');
});

module.exports = {
    getMentors,
    getMentorDetails,
    getActivity,
    searchUsers
};
