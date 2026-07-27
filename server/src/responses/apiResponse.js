const sendSuccess = (res, data, message = "Success", statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

const sendError = (res, error, message = "An error occurred", statusCode = 500) => {
    return res.status(statusCode).json({
        success: false,
        message,
        error: error instanceof Error ? error.message : error
    });
};

module.exports = {
    sendSuccess,
    sendError
};
