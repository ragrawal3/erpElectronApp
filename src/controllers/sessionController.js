const sessionRepository = require('../repositories/sessionRepository');
const { sendSuccess } = require('../utils/sendResponse');
const sucessCodes = require('../constants/successCodes');

exports.getActiveSessions = async (req, res, next) => {
    try {
        const result  = await sessionRepository.getActiveSessions(req.masterDbPool);

        const sessions = result.rows.map(row => ({
            sessionId: row.sid,
            user: row.sess.user || null,
            firm: row.sess.firm || null,
            expiresAt: row.expire
        }));

        sendSuccess(res, sucessCodes.LOGIN_SUCCESS, sessions);
    } catch(err) {
        next(err);
    }   
}

exports.deleteSession = async (req, res, next) => {
    const { sessionId } = req.params;

    try {
        const result  = await sessionRepository.deleteSession(req.masterDbPool, sessionId);

        sendSuccess(res, sucessCodes.LOGIN_SUCCESS, result);
    } catch(err) {
        next(err);
    }   
}