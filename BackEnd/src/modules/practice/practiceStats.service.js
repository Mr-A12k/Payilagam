/**
 * @file practiceStats.service.js
 * @description Manages user XP, levels, streaks, and the global leaderboard
 */

const prisma = require('../../config/prisma');

const XP_REWARDS = { easy: 20, medium: 50, hard: 100 };
const FIRST_SOLVE_BONUS = 10;
const DAILY_BONUS_MULTIPLIER = 2;

const LEVELS = [
    { level: 1, minXP: 0,    title: 'Beginner' },
    { level: 2, minXP: 100,  title: 'Explorer' },
    { level: 3, minXP: 300,  title: 'Problem Solver' },
    { level: 4, minXP: 600,  title: 'Code Warrior' },
    { level: 5, minXP: 1000, title: 'Algorithm Master' },
    { level: 6, minXP: 2000, title: 'Elite Coder' },
];

const getLevelInfo = (xp) => {
    let current = LEVELS[0];
    let next = LEVELS[1];
    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (xp >= LEVELS[i].minXP) {
            current = LEVELS[i];
            next = LEVELS[i + 1] || null;
            break;
        }
    }
    const progressXP = next ? xp - current.minXP : 0;
    const totalXPForLevel = next ? next.minXP - current.minXP : 1;
    const progressPct = next ? Math.round((progressXP / totalXPForLevel) * 100) : 100;
    return { ...current, next, progressXP, totalXPForLevel, progressPct };
};

/**
 * Get or create practice stats for a user
 */
const getOrCreateStats = async (userId) => {
    let stats = await prisma.userPracticeStats.findUnique({ where: { userId } });
    if (!stats) {
        stats = await prisma.userPracticeStats.create({
            data: { userId },
        });
    }
    return stats;
};

/**
 * Get full stats for a user including level info
 */
const getUserPracticeStats = async (userId) => {
    const stats = await getOrCreateStats(userId);
    const levelInfo = getLevelInfo(stats.xp);
    const badges = JSON.parse(stats.badges || '[]');

    return {
        ...stats,
        levelInfo,
        badges,
    };
};

/**
 * Award XP after a successful submission
 */
const awardXpForSolve = async (userId, problemId, difficulty) => {
    const stats = await getOrCreateStats(userId);

    // Check if this problem was already solved before (first-solve bonus)
    const previousAccepted = await prisma.codingSubmission.count({
        where: { studentId: userId, problemId, status: 'accepted' },
    });
    const isFirstSolve = previousAccepted === 0; // This runs before the new submission is saved

    // Check if it's the daily challenge
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const dailyChallenge = await prisma.dailyChallenge.findFirst({
        where: {
            date: { gte: today, lt: tomorrow },
            problemId,
        },
    });
    const isDailyChallenge = !!dailyChallenge;

    let xpEarned = XP_REWARDS[difficulty] || 20;
    if (isFirstSolve) xpEarned += FIRST_SOLVE_BONUS;
    if (isDailyChallenge) xpEarned *= DAILY_BONUS_MULTIPLIER;

    // Update streak
    const now = new Date();
    const lastSolved = stats.lastSolvedAt ? new Date(stats.lastSolvedAt) : null;
    let newStreak = stats.currentStreak;

    if (lastSolved) {
        const diffMs = now - lastSolved;
        const diffHours = diffMs / (1000 * 60 * 60);
        if (diffHours < 36) {
            // Within 36 hours — extend streak
            const lastDate = new Date(lastSolved);
            lastDate.setHours(0, 0, 0, 0);
            const todayDate = new Date();
            todayDate.setHours(0, 0, 0, 0);
            if (lastDate.getTime() !== todayDate.getTime()) {
                newStreak = stats.currentStreak + 1;
            }
        } else {
            // Gap > 36 hours — reset streak
            newStreak = 1;
        }
    } else {
        newStreak = 1;
    }

    const newXp = stats.xp + xpEarned;
    const newLevel = getLevelInfo(newXp).level;
    const leveledUp = newLevel > stats.level;

    // Award badges
    const currentBadges = JSON.parse(stats.badges || '[]');
    const newBadges = [...currentBadges];
    const totalSolvedAfter = stats.totalSolved + 1;

    if (!currentBadges.includes('first_blood') && isFirstSolve && totalSolvedAfter === 1) {
        newBadges.push('first_blood');
    }
    if (!currentBadges.includes('streak_7') && newStreak >= 7) {
        newBadges.push('streak_7');
    }
    if (!currentBadges.includes('century') && totalSolvedAfter >= 100) {
        newBadges.push('century');
    }
    if (!currentBadges.includes('first_perfect') && isFirstSolve) {
        newBadges.push('first_perfect');
    }

    const updatedStats = await prisma.userPracticeStats.update({
        where: { userId },
        data: {
            xp: newXp,
            level: newLevel,
            currentStreak: newStreak,
            longestStreak: Math.max(stats.longestStreak, newStreak),
            lastSolvedAt: now,
            totalSolved: { increment: isFirstSolve ? 1 : 0 },
            easySolved: { increment: isFirstSolve && difficulty === 'easy' ? 1 : 0 },
            mediumSolved: { increment: isFirstSolve && difficulty === 'medium' ? 1 : 0 },
            hardSolved: { increment: isFirstSolve && difficulty === 'hard' ? 1 : 0 },
            badges: JSON.stringify(newBadges),
        },
    });

    return {
        xpEarned,
        newXp,
        isFirstSolve,
        isDailyChallenge,
        leveledUp,
        newLevel,
        newBadges: newBadges.filter(b => !currentBadges.includes(b)),
        currentStreak: newStreak,
        levelInfo: getLevelInfo(newXp),
    };
};

/**
 * Get global leaderboard (top N users by XP)
 */
const getLeaderboard = async (limit = 50, userId = null) => {
    const topUsers = await prisma.userPracticeStats.findMany({
        orderBy: { xp: 'desc' },
        take: limit,
        include: {
            user: {
                select: { userId: true, userName: true, fullName: true, profileUrl: true },
            },
        },
    });

    const leaderboard = topUsers.map((entry, index) => ({
        rank: index + 1,
        userId: entry.userId,
        userName: entry.user.userName,
        fullName: entry.user.fullName,
        profileUrl: entry.user.profileUrl,
        xp: entry.xp,
        level: entry.level,
        levelInfo: getLevelInfo(entry.xp),
        totalSolved: entry.totalSolved,
        currentStreak: entry.currentStreak,
        badges: JSON.parse(entry.badges || '[]'),
        isCurrentUser: entry.userId === userId,
    }));

    // If logged-in user is not in top N, find their rank
    let userRank = null;
    if (userId) {
        const userInTop = leaderboard.find(e => e.userId === userId);
        if (!userInTop) {
            const count = await prisma.userPracticeStats.count({
                where: { xp: { gt: (await prisma.userPracticeStats.findUnique({ where: { userId } }))?.xp || 0 } },
            });
            userRank = count + 1;
        }
    }

    return { leaderboard, userRank };
};

/**
 * Get or create today's daily challenge
 */
const getDailyChallenge = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    let daily = await prisma.dailyChallenge.findFirst({
        where: { date: { gte: today, lt: tomorrow } },
        include: {
            problem: {
                select: { problemId: true, title: true, slug: true, difficulty: true, description: true },
            },
        },
    });

    // Auto-create one if none exists — pick a random active problem
    if (!daily) {
        const problems = await prisma.codingProblem.findMany({
            where: { isActive: true },
            select: { problemId: true },
        });

        if (problems.length > 0) {
            const random = problems[Math.floor(Math.random() * problems.length)];
            daily = await prisma.dailyChallenge.create({
                data: { problemId: random.problemId, date: today },
                include: {
                    problem: {
                        select: { problemId: true, title: true, slug: true, difficulty: true, description: true },
                    },
                },
            });
        }
    }

    return daily;
};

module.exports = {
    getUserPracticeStats,
    awardXpForSolve,
    getLeaderboard,
    getDailyChallenge,
    getLevelInfo,
};
