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

const applyAsMentor = catchAsync(async (request, response) => {
    const userId = request.user.userId;
    const { bio, skills, experience } = request.body;
    
    try {
        const application = await userService.applyAsMentor(userId, bio, skills, experience);
        return success(response, application, 'Mentor application submitted successfully');
    } catch (err) {
        return response.status(400).json({ success: false, message: err.message });
    }
});

const getMentorApplications = catchAsync(async (request, response) => {
    const role = request.user.role;
    if (role !== "admin") {
        return response.status(403).json({ success: false, message: "Unauthorized. Admin access only." });
    }

    const applications = await userService.getMentorApplications();
    return success(response, applications, 'Mentor applications retrieved successfully');
});

const updateMentorApplicationStatus = catchAsync(async (request, response) => {
    const role = request.user.role;
    if (role !== "admin") {
        return response.status(403).json({ success: false, message: "Unauthorized. Admin access only." });
    }

    const { id } = request.params;
    const { status } = request.body; // APPROVED or REJECTED

    if (status !== "APPROVED" && status !== "REJECTED") {
        return response.status(400).json({ success: false, message: "Invalid application status" });
    }

    try {
        const updated = await userService.updateMentorApplicationStatus(id, status);
        return success(response, updated, `Application status updated to ${status}`);
    } catch (err) {
        return response.status(400).json({ success: false, message: err.message });
    }
});

const getMyMentorApplication = catchAsync(async (request, response) => {
    const userId = request.user.userId;
    const application = await userService.getMyMentorApplication(userId);
    return success(response, application, 'My mentor application retrieved successfully');
});

module.exports = {
    getMentors,
    getMentorDetails,
    getActivity,
    searchUsers,
    applyAsMentor,
    getMentorApplications,
    updateMentorApplicationStatus,
    getMyMentorApplication
};
