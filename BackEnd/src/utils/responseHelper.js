/**
 * Standardized API response helpers
 * All API responses follow: { success, message, data }
 */

const success = (response, data = null, message = 'Success', statusCode = 200) => {
    return response.status(statusCode).json({
        success: true,
        statusCode,
        message,
        data,
    });
};

const error = (response, message = 'Something went wrong', statusCode = 400, errors = null) => {
    const errorPayload = {
        success: false,
        statusCode,
        message,
    };
    if (errors) {
        errorPayload.errors = errors;
    }
    return response.status(statusCode).json(errorPayload);
};

const paginated = (response, data, pagination, message = 'Success') => {
    return response.status(200).json({
        success: true,
        statusCode: 200,
        message,
        data,
        pagination,
    });
};

module.exports = {
    success,
    error,
    paginated,
};
