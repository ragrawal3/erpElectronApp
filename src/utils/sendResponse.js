exports.sendSuccess = (res, successCode, data = {}) => {
    const {statusCode = 200, message='Success', code='SUCCESS'} = successCode;
    res.status(statusCode).json({
        success: true,
        code,
        message,
        data
    });
};

// NotUsed
exports.sendError = (res, error) => {
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Internal Server Error'
    });
};