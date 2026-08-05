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

    if (!user) throw new Error('User not found');

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

const applyAsMentor = async (userId, bio, skills, experience) => {
    // Check if user is already a mentor
    const userObj = await prisma.user.findUnique({
        where: { userId },
        include: { role: true }
    });
    if (userObj && userObj.role?.roleName === "mentor") {
        throw new Error("You are already a mentor");
    }

    // Check for existing pending application
    const existing = await prisma.mentorApplication.findFirst({
        where: { userId, status: "PENDING" }
    });
    if (existing) {
        throw new Error("You already have a pending mentor application");
    }

    return await prisma.mentorApplication.create({
        data: {
            userId,
            bio,
            skills,
            experience,
            status: "PENDING"
        }
    });
};

const getMentorApplications = async () => {
    return await prisma.mentorApplication.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            user: {
                select: {
                    userId: true,
                    fullName: true,
                    email: true,
                    profileUrl: true
                }
            }
        }
    });
};

const updateMentorApplicationStatus = async (id, status) => {
    const application = await prisma.mentorApplication.findUnique({
        where: { id: parseInt(id) },
        include: { user: true }
    });
    if (!application) throw new Error("Application not found");

    if (status === "APPROVED") {
        const mentorRole = await prisma.role.findUnique({
            where: { roleName: "mentor" }
        });
        if (!mentorRole) throw new Error("Mentor role not configured in database");

        // Update user role to mentor (2)
        await prisma.user.update({
            where: { userId: application.userId },
            data: { roleId: mentorRole.roleId }
        });
    }

    return await prisma.mentorApplication.update({
        where: { id: parseInt(id) },
        data: { status },
        include: {
            user: {
                select: {
                    userId: true,
                    fullName: true,
                    email: true
                }
            }
        }
    });
};

const getMyMentorApplication = async (userId) => {
    return await prisma.mentorApplication.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" }
    });
};

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
