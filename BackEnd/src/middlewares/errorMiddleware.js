/**
 * Global error handling middleware
 */

const logger = require("../utils/logger");

const notFound = (request, response, next) => {
  const error = new Error(`Not Found - ${request.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (error, request, response, next) => {
  const statusCode = error.statusCode || 500;

  // Log all errors using Winston
  logger.error(
    `${request.method} ${request.originalUrl} - ${error.message}`,
    { stack: error.stack }
  );

  // Handle Prisma errors
  if (error.code === "P2002") {
    return response.status(409).json({
      success: false,
      message: `Duplicate value: ${error.meta?.target?.join(", ") || "unique field"} already exists.`,
    });
  }

  if (error.code === "P2025") {
    return response.status(404).json({
      success: false,
      message: "Record not found.",
    });
  }

  if (error.code === "P2003") {
    return response.status(400).json({
      success: false,
      message: "Foreign key constraint failed. Related record not found.",
    });
  }

  response.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? "Internal server error" : error.message,
    ...(process.env.NODE_ENV !== "production" && { stack: error.stack }),
  });
};

module.exports = {
  notFound,
  errorHandler,
};
