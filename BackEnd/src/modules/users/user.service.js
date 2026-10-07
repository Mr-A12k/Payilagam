const prisma = require('../../config/prisma');

const getMentors = async () => {
    // Role 2 is usually Mentor in this system, but let's query by role name to be safe
    const mentorRole = await prisma.role.findUnique({
        where: { roleName: 'mentor' }
    });

    if (!mentorRole) throw new Error('Mentor role not found');

    const mentors = await prisma.user.findMany({
        where: {
            roleId: mentorRole.roleId,
            isActive: true
        },
        select: {
            userId: true,
            userName: true,
            fullName: true,
            profileUrl: true,
            bio: true,
            skills: true,
            role: { select: { roleName: true } },
            _count: {
                select: {
                    followers: true,
                    coursesTaught: true
                }
            }
        }
    });

    return mentors;
};

const getMentorDetails = async (userId, currentUserId) => {
    if (!/^\d+$/.test(String(userId)) || Number(userId) < 1) {
        throw Object.assign(new Error('Invalid mentor ID'), { statusCode: 400 });
    }
    const user = await prisma.user.findUnique({
        where: { userId: parseInt(userId) },
        include: {
            role: true,
            coursesTaught: {
                select: {
                    courseId: true,
                    uniqueId: true,
                    courseName: true,
                    description: true,
                    thumbnail: true,
                    level: true,
                    _count: {
                        select: { enrollments: true }
                    }
                }
            },
            _count: {
                select: {
                    followers: true,
                    coursesTaught: true,
                    enrollments: true
                }
            }
        }
    });

    if (!user || !user.isActive || user.role.roleName !== 'mentor') throw new Error('Mentor not found');

    let isFollowing = false;
    if (currentUserId) {
        const follow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: currentUserId,
                    followingId: parseInt(userId)
                }
            }
        });
        isFollowing = !!follow;
    }

    return {
        ...user,
        password: undefined,
        isFollowing
    };
};

const getActivity = async (userId, days = 365) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const progressLogs = await prisma.lessonProgress.findMany({
        where: {
            studentId: parseInt(userId),
            updatedAt: { gte: startDate }
        },
        select: { updatedAt: true, completed: true }
    });

    const activityMap = {};

    progressLogs.forEach(log => {
        const dateStr = log.updatedAt.toISOString().split('T')[0];
        if (!activityMap[dateStr]) {
            activityMap[dateStr] = 0;
        }
        activityMap[dateStr] += log.completed ? 2 : 1; 
    });

    return activityMap;
};

const searchUsers = async (query, currentUserId) => {
    if (!query) return [];
    
    const users = await prisma.user.findMany({
        where: {
            OR: [
                { userName: { contains: query } },
                { fullName: { contains: query } },
                { email: { contains: query } }
            ],
            userId: { not: parseInt(currentUserId) },
            isActive: true
        },
        select: {
            userId: true,
            userName: true,
            fullName: true,
            profileUrl: true,
            role: { select: { roleName: true } }
        },
        take: 20
    });
    
    return users;
};

// Preserve existing service imports while application logic has its own owner.
const {
    applyAsMentor,
    getMentorApplications,
    updateMentorApplicationStatus,
    getMyMentorApplication
} = require('./mentorApplication.service');

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
