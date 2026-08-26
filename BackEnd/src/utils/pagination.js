/**
 * Pagination utility for Prisma queries
 * Extracts page/limit from query params, returns Prisma skip/take + metadata
 */

const getPaginationParams = (query) => {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
    const skip = (page - 1) * limit;

    return { page, limit, skip, take: limit };
};

const getPaginationMeta = (total, page, limit) => {
    const totalPages = Math.ceil(total / limit);
    return {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
    };
};

const getSortParams = (query, allowedFields = ['createdAt'], defaultField = 'createdAt', defaultOrder = 'desc') => {
    const sortBy = allowedFields.includes(query.sortBy) ? query.sortBy : defaultField;
    const sortOrder = ['asc', 'desc'].includes(query.sortOrder) ? query.sortOrder : defaultOrder;
    return { [sortBy]: sortOrder };
};

module.exports = {
    getPaginationParams,
    getPaginationMeta,
    getSortParams,
};
