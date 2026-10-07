const prisma = require('../../config/prisma');

const applyAsMentor = async (userId, bio, skills, experience) => {
    if ([bio, skills, experience].some(value => typeof value !== 'string' || !value.trim())) {
        throw new Error('Bio, skills, and experience are required');
    }
    if (bio.length > 10000 || skills.length > 2000 || experience.length > 10000) throw new Error('Application text exceeds the allowed length');
    return prisma.$transaction(async tx => {
        // Serialize submissions for one applicant without locking the entire queue.
        await tx.$queryRaw`SELECT user_id FROM users WHERE user_id = ${userId} FOR UPDATE`;
        // Check if user is already a mentor
        const userObj = await tx.user.findUnique({
            where: { userId },
            include: { role: true }
        });
        if (userObj && userObj.role?.roleName === "mentor") {
            throw new Error("You are already a mentor");
        }
        if (!userObj?.isActive || userObj.role?.roleName !== 'student') throw new Error('Only active students can apply as mentors');

        // Check for existing pending application
        const existing = await tx.mentorApplication.findFirst({
            where: { userId, status: "PENDING" }
        });
        if (existing) {
            throw new Error("You already have a pending mentor application");
        }

        return await tx.mentorApplication.create({
            data: {
                userId,
                bio: bio.trim(),
                skills: skills.trim(),
                experience: experience.trim(),
                status: "PENDING"
            }
        });
    });
};

const getMentorApplications = async (query = {}) => {
    const positiveInteger = (value, fallback, max) => {
        if (value === undefined) return fallback;
        if (!/^\d+$/.test(String(value)) || Number(value) < 1 || Number(value) > max) {
            throw Object.assign(new Error('Invalid pagination parameters'), { statusCode: 400 });
        }
        return Number(value);
    };
    const page = positiveInteger(query.page, 1, 100000);
    const limit = positiveInteger(query.limit, 20, 100);
    const status = query.status || 'ALL';
    if (!['ALL', 'PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
        throw Object.assign(new Error('Invalid application status filter'), { statusCode: 400 });
    }
    if (query.search !== undefined && (typeof query.search !== 'string' || query.search.length > 200)) {
        throw Object.assign(new Error('Search must be at most 200 characters'), { statusCode: 400 });
    }
    const search = (query.search || '').trim();
    const where = {
        ...(status !== 'ALL' ? { status } : {}),
        ...(search ? { OR: [
            { user: { fullName: { contains: search, mode: 'insensitive' } } },
            { user: { email: { contains: search, mode: 'insensitive' } } },
            { skills: { contains: search, mode: 'insensitive' } },
        ] } : {}),
    };
    const [applications, total] = await prisma.$transaction([prisma.mentorApplication.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
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
    }), prisma.mentorApplication.count({ where })]);
    return { applications, pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasNext: page * limit < total } };
};

const updateMentorApplicationStatus = async (id, status) => {
    if (!/^\d+$/.test(String(id)) || !Number.isSafeInteger(Number(id)) || Number(id) < 1 || Number(id) > 2147483647) throw Object.assign(new Error('Invalid application ID'), { statusCode: 400 });
    if (!['APPROVED', 'REJECTED'].includes(status)) throw Object.assign(new Error('Invalid application status'), { statusCode: 400 });
    return prisma.$transaction(async tx => {
        const application = await tx.mentorApplication.findUnique({
            where: { id: parseInt(id) },
            include: { user: true }
        });
        if (!application) throw Object.assign(new Error('Application not found'), { statusCode: 404 });
        if (application.status !== 'PENDING') throw Object.assign(new Error('Application has already been reviewed'), { statusCode: 409 });
        if (!application.user.isActive) throw new Error('Cannot review an inactive account');

        // Conditional update serializes competing reviews before any role change.
        const claimed = await tx.mentorApplication.updateMany({
            where: { id: application.id, status: 'PENDING' }, data: { status },
        });
        if (claimed.count !== 1) throw Object.assign(new Error('Application has already been reviewed'), { statusCode: 409 });
        if (status === "APPROVED") {
            const mentorRole = await tx.role.findUnique({
                where: { roleName: "mentor" }
            });
            if (!mentorRole) throw new Error("Mentor role not configured in database");

            // Do not overwrite an administrative role change or deactivation.
            const promoted = await tx.user.updateMany({
                where: { userId: application.userId, isActive: true, role: { roleName: 'student' } },
                data: { roleId: mentorRole.roleId, bio: application.bio, skills: JSON.stringify(application.skills.split(',').map(skill => skill.trim()).filter(Boolean)), experience: application.experience }
            });
            if (promoted.count !== 1) throw Object.assign(new Error('Applicant must still be an active student'), { statusCode: 409 });
        }

        return await tx.mentorApplication.update({
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
    });
};

const getMyMentorApplication = async (userId) => {
    return await prisma.mentorApplication.findFirst({
        where: { userId },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }]
    });
};

module.exports = {
    applyAsMentor,
    getMentorApplications,
    updateMentorApplicationStatus,
    getMyMentorApplication
};
