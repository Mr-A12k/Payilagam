/**
 * @file catchAsync.js
 * @description Utility to wrap async route handlers and automatically pass errors to Express's next().
 * Eliminates the need for repetitive try/catch blocks in every controller.
 */

const catchAsync = (fn) => {
    return (request, response, next) => {
        Promise.resolve(fn(request, response, next)).catch(next);
    };
};

module.exports = catchAsync;
