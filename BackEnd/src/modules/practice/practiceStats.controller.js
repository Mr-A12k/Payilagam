const catchAsync = require('../../utils/catchAsync');
const { success } = require('../../utils/responseHelper');
const practiceStatsService = require('./practiceStats.service');

/**
 * GET /api/practice/stats
 * Get current user's XP, level, streak (authenticated)
 */
const getMyStats = catchAsync(async (request, response) => {
    const stats = await practiceStatsService.getUserPracticeStats(request.user.userId);
    return success(response, stats, 'Stats retrieved');
});

/**
 * GET /api/practice/leaderboard
 * Public: top 10 only. Authenticated: full top 50 + user rank
 */
const getLeaderboard = catchAsync(async (request, response) => {
    const isAuthenticated = !!request.user;
    const limit = isAuthenticated ? 50 : 10;
    const userId = request.user?.userId || null;

    const data = await practiceStatsService.getLeaderboard(limit, userId);
    return success(response, data, 'Leaderboard retrieved');
});

/**
 * GET /api/practice/daily-challenge
 * Today's featured challenge
 */
const getDailyChallenge = catchAsync(async (request, response) => {
    const challenge = await practiceStatsService.getDailyChallenge();
    return success(response, challenge, 'Daily challenge retrieved');
});

module.exports = { getMyStats, getLeaderboard, getDailyChallenge };
