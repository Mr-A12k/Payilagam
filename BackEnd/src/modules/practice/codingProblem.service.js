const prisma = require('../../config/prisma');
const { getPaginationMeta } = require('../../utils/pagination');

/**
 * Generate a URL-friendly slug from a title
 */
const generateSlug = (title) => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
};

/**
 * Ensure slug uniqueness by appending a numeric suffix if needed
 */
const ensureUniqueSlug = async (baseSlug, excludeProblemId = null) => {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const existing = await prisma.codingProblem.findUnique({
            where: { slug },
        });

        if (!existing || (excludeProblemId && existing.problemId === excludeProblemId)) {
            return slug;
        }

        slug = `${baseSlug}-${counter}`;
        counter++;
    }
};

/**
 * Create a new coding problem
 */
const createProblem = async (creatorId, data) => {
    const {
        title,
        description,
        difficulty,
        constraints,
        inputFormat,
        outputFormat,
        sampleInput,
        sampleOutput,
        explanation,
        supportedLanguages,
        starterCode,
        tags, // array of tag names
    } = data;

    if (!title || !description || !difficulty) {
        throw new Error('Title, description, and difficulty are required');
    }

    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
        throw new Error('Difficulty must be easy, medium, or hard');
    }

    const baseSlug = generateSlug(title);
    const slug = await ensureUniqueSlug(baseSlug);

    const problemData = {
        title,
        slug,
        description,
        difficulty,
        constraints: constraints || null,
        inputFormat: inputFormat || null,
        outputFormat: outputFormat || null,
        sampleInput: sampleInput || null,
        sampleOutput: sampleOutput || null,
        explanation: explanation || null,
        supportedLanguages: supportedLanguages
            ? (typeof supportedLanguages === 'string' ? supportedLanguages : JSON.stringify(supportedLanguages))
            : undefined,
        starterCode: starterCode
            ? (typeof starterCode === 'string' ? starterCode : JSON.stringify(starterCode))
            : null,
        createdBy: creatorId,
    };

    // If tags are provided, connect or create them
    if (tags && Array.isArray(tags) && tags.length > 0) {
        problemData.tags = {
            create: await Promise.all(
                tags.map(async (tagName) => {
                    const tagSlug = generateSlug(tagName);
                    let tag = await prisma.problemTag.findUnique({ where: { name: tagName } });
                    if (!tag) {
                        tag = await prisma.problemTag.create({
                            data: { name: tagName, slug: tagSlug },
                        });
                    }
                    return { tagId: tag.tagId };
                })
            ),
        };
    }

    const problem = await prisma.codingProblem.create({
        data: problemData,
        include: {
            creator: {
                select: { userId: true, userName: true, fullName: true },
            },
            tags: {
                include: { tag: true },
            },
        },
    });

    return problem;
};

/**
 * Get all problems with filtering, pagination, and acceptance rate
 */
const getAllProblems = async (filters = {}, pagination = {}) => {
    const { difficulty, tag, search, isActive } = filters;
    const { skip, take, page, limit } = pagination;

    const where = {};

    // Default to active problems only
    where.isActive = isActive !== undefined ? isActive : true;

    if (difficulty) {
        where.difficulty = difficulty;
    }

    if (tag) {
        where.tags = {
            some: {
                tag: { name: tag },
            },
        };
    }

    if (search) {
        where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
        ];
    }

    const [problems, total] = await Promise.all([
        prisma.codingProblem.findMany({
            where,
            skip,
            take,
            orderBy: { createdAt: 'desc' },
            include: {
                creator: {
                    select: { userId: true, userName: true, fullName: true },
                },
                tags: {
                    include: { tag: true },
                },
                _count: {
                    select: { submissions: true },
                },
            },
        }),
        prisma.codingProblem.count({ where }),
    ]);

    // Calculate acceptance rate for each problem
    const problemsWithStats = await Promise.all(
        problems.map(async (problem) => {
            const totalSubmissions = problem._count.submissions;
            const acceptedSubmissions = await prisma.codingSubmission.count({
                where: {
                    problemId: problem.problemId,
                    status: 'accepted',
                },
            });

            return {
                ...problem,
                totalSubmissions,
                acceptedSubmissions,
                acceptanceRate: totalSubmissions > 0
                    ? parseFloat(((acceptedSubmissions / totalSubmissions) * 100).toFixed(1))
                    : 0,
            };
        })
    );

    const paginationMeta = getPaginationMeta(total, page, limit);

    return { problems: problemsWithStats, pagination: paginationMeta };
};

/**
 * Get full problem details by ID
 * Students only see non-hidden test cases
 */
const getProblemById = async (problemId, userRole = 'student') => {
    const problem = await prisma.codingProblem.findUnique({
        where: { problemId: parseInt(problemId) },
        include: {
            creator: {
                select: { userId: true, userName: true, fullName: true },
            },
            tags: {
                include: { tag: true },
            },
            testCases: {
                where: userRole === 'student' ? { isHidden: false } : {},
                orderBy: { orderIndex: 'asc' },
            },
            _count: {
                select: { submissions: true },
            },
        },
    });

    if (!problem) {
        throw new Error('Problem not found');
    }

    return problem;
};

/**
 * Get full problem details by slug
 */
const getProblemBySlug = async (slug, userRole = 'student') => {
    const problem = await prisma.codingProblem.findUnique({
        where: { slug },
        include: {
            creator: {
                select: { userId: true, userName: true, fullName: true },
            },
            tags: {
                include: { tag: true },
            },
            testCases: {
                where: userRole === 'student' ? { isHidden: false } : {},
                orderBy: { orderIndex: 'asc' },
            },
            _count: {
                select: { submissions: true },
            },
        },
    });

    if (!problem) {
        throw new Error('Problem not found');
    }

    return problem;
};

/**
 * Update an existing problem
 */
const updateProblem = async (problemId, data) => {
    const id = parseInt(problemId);

    const existing = await prisma.codingProblem.findUnique({ where: { problemId: id } });
    if (!existing) {
        throw new Error('Problem not found');
    }

    const {
        title,
        description,
        difficulty,
        constraints,
        inputFormat,
        outputFormat,
        sampleInput,
        sampleOutput,
        explanation,
        supportedLanguages,
        starterCode,
        tags,
    } = data;

    if (difficulty && !['easy', 'medium', 'hard'].includes(difficulty)) {
        throw new Error('Difficulty must be easy, medium, or hard');
    }

    const updateData = {};

    if (title !== undefined) {
        updateData.title = title;
        // Re-generate slug if title changes
        const baseSlug = generateSlug(title);
        updateData.slug = await ensureUniqueSlug(baseSlug, id);
    }
    if (description !== undefined) updateData.description = description;
    if (difficulty !== undefined) updateData.difficulty = difficulty;
    if (constraints !== undefined) updateData.constraints = constraints;
    if (inputFormat !== undefined) updateData.inputFormat = inputFormat;
    if (outputFormat !== undefined) updateData.outputFormat = outputFormat;
    if (sampleInput !== undefined) updateData.sampleInput = sampleInput;
    if (sampleOutput !== undefined) updateData.sampleOutput = sampleOutput;
    if (explanation !== undefined) updateData.explanation = explanation;
    if (supportedLanguages !== undefined) {
        updateData.supportedLanguages = typeof supportedLanguages === 'string'
            ? supportedLanguages
            : JSON.stringify(supportedLanguages);
    }
    if (starterCode !== undefined) {
        updateData.starterCode = typeof starterCode === 'string'
            ? starterCode
            : JSON.stringify(starterCode);
    }

    // Handle tag updates: clear existing and re-create
    if (tags && Array.isArray(tags)) {
        await prisma.problemTagMap.deleteMany({ where: { problemId: id } });

        for (const tagName of tags) {
            const tagSlug = generateSlug(tagName);
            let tag = await prisma.problemTag.findUnique({ where: { name: tagName } });
            if (!tag) {
                tag = await prisma.problemTag.create({
                    data: { name: tagName, slug: tagSlug },
                });
            }
            await prisma.problemTagMap.create({
                data: { problemId: id, tagId: tag.tagId },
            });
        }
    }

    const problem = await prisma.codingProblem.update({
        where: { problemId: id },
        data: updateData,
        include: {
            creator: {
                select: { userId: true, userName: true, fullName: true },
            },
            tags: {
                include: { tag: true },
            },
        },
    });

    return problem;
};

/**
 * Soft delete a problem (set isActive = false)
 */
const deleteProblem = async (problemId) => {
    const id = parseInt(problemId);

    const existing = await prisma.codingProblem.findUnique({ where: { problemId: id } });
    if (!existing) {
        throw new Error('Problem not found');
    }

    const problem = await prisma.codingProblem.update({
        where: { problemId: id },
        data: { isActive: false },
    });

    return problem;
};

/**
 * Get detailed statistics for a problem
 */
const getProblemStats = async (problemId) => {
    const id = parseInt(problemId);

    const existing = await prisma.codingProblem.findUnique({ where: { problemId: id } });
    if (!existing) {
        throw new Error('Problem not found');
    }

    const [totalSubmissions, acceptedSubmissions, submissions] = await Promise.all([
        prisma.codingSubmission.count({ where: { problemId: id } }),
        prisma.codingSubmission.count({ where: { problemId: id, status: 'accepted' } }),
        prisma.codingSubmission.findMany({
            where: { problemId: id },
            select: { language: true },
        }),
    ]);

    // Language distribution
    const languageCounts = {};
    submissions.forEach((sub) => {
        languageCounts[sub.language] = (languageCounts[sub.language] || 0) + 1;
    });

    const languageDistribution = Object.entries(languageCounts).map(([language, count]) => ({
        language,
        count,
        percentage: totalSubmissions > 0
            ? parseFloat(((count / totalSubmissions) * 100).toFixed(1))
            : 0,
    }));

    return {
        problemId: id,
        totalSubmissions,
        acceptedSubmissions,
        acceptanceRate: totalSubmissions > 0
            ? parseFloat(((acceptedSubmissions / totalSubmissions) * 100).toFixed(1))
            : 0,
        languageDistribution,
    };
};

module.exports = {
    createProblem,
    getAllProblems,
    getProblemById,
    getProblemBySlug,
    updateProblem,
    deleteProblem,
    getProblemStats,
};
