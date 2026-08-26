const catchAsync = require('../../utils/catchAsync');
const { success, error } = require('../../utils/responseHelper');
const labsService = require('./labs.service');

/**
 * POST /api/labs/run
 * Execute code freely (no test cases) — works for guests too
 */
const runCode = catchAsync(async (request, response) => {
    const { code, language, stdin } = request.body;

    if (!code || !language) {
        return error(response, 'code and language are required', 400);
    }

    const userId = request.user?.userId || null;
    const result = await labsService.runLabCode(code, language, stdin || '', userId);
    return success(response, result, 'Code executed');
});

/**
 * POST /api/labs/share
 * Save code and return a share link slug
 */
const shareCode = catchAsync(async (request, response) => {
    const { code, language } = request.body;

    if (!code || !language) {
        return error(response, 'code and language are required', 400);
    }

    const userId = request.user?.userId || null;
    const result = await labsService.saveAndShareCode(code, language, userId);
    return success(response, result, 'Code saved');
});

/**
 * GET /api/labs/share/:slug
 * Load shared code
 */
const getShared = catchAsync(async (request, response) => {
    const { slug } = request.params;
    const result = await labsService.getSharedCode(slug);
    return success(response, result, 'Shared code loaded');
});

/**
 * GET /api/labs/languages
 * Get supported languages
 */
const getLanguages = catchAsync(async (request, response) => {
    const languages = labsService.getLanguages();
    return success(response, languages, 'Languages fetched');
});

module.exports = { runCode, shareCode, getShared, getLanguages };
