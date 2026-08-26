/**
 * @file labs.service.js
 * @description Service for the Online Compiler / Labs feature.
 * Handles free code execution (no test cases), code sharing, and language metadata.
 */

const prisma = require('../../config/prisma');
const { executeInLab, LANGUAGE_IDS, LANGUAGE_NAMES } = require('./judge0.service');
const crypto = require('crypto');

/**
 * Run arbitrary code in the lab environment
 */
const runLabCode = async (code, language, stdin = '', userId = null) => {
    if (!code || !code.trim()) {
        throw new Error('Code cannot be empty');
    }

    if (!LANGUAGE_IDS[language]) {
        throw new Error(`Unsupported language: ${language}`);
    }

    const result = await executeInLab(code, language, stdin);

    // Optionally save session for logged-in users
    if (userId) {
        await prisma.labSession.create({
            data: {
                userId,
                language,
                code,
                output: result.output || result.errorMessage || '',
            },
        }).catch(() => {}); // Non-blocking, ignore errors
    }

    return result;
};

/**
 * Save code and generate a shareable slug
 */
const saveAndShareCode = async (code, language, userId = null) => {
    if (!code || !code.trim()) {
        throw new Error('Code cannot be empty');
    }

    const slug = crypto.randomBytes(5).toString('hex'); // e.g. 'a1b2c3d4e5'

    const session = await prisma.labSession.create({
        data: {
            userId,
            language,
            code,
            shareSlug: slug,
        },
    });

    return { slug, sessionId: session.id };
};

/**
 * Load shared code by slug
 */
const getSharedCode = async (slug) => {
    const session = await prisma.labSession.findUnique({
        where: { shareSlug: slug },
    });

    if (!session) {
        throw new Error('Shared code not found or has expired');
    }

    return session;
};

/**
 * Get available languages with metadata
 */
const getLanguages = () => {
    return Object.entries(LANGUAGE_IDS).map(([key, id]) => ({
        id: key,
        name: LANGUAGE_NAMES[key] || key,
        judgeId: id,
    }));
};

module.exports = {
    runLabCode,
    saveAndShareCode,
    getSharedCode,
    getLanguages,
};
