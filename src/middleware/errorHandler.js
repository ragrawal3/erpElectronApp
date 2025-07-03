// Centralized error handler to keep standard responce for diffrect error scenarios (known & unKnown).
const sendResponse = require('../utils/sendResponse');
const errorCodes = require('../constants/errorCodes');

const errorHandler = (err, req, res, next) => {
    console.log("errorHandler aa gaya");
    console.error(err);
    
    const statusCode = err.statusCode || 500;
    //code check because sql error has its own code and thats getting assiged to respose code.
    const code = err.code?.length!==5 ? err.code : errorCodes.UNKNOWN_ERROR.code;
    const message = err.message || errorCodes.UNKNOWN_ERROR.message;

    res.status(statusCode).json({
        success: false,
        code,
        message
    });
    next();
};

module.exports = errorHandler;