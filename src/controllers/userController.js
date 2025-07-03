const userRepository = require('../repositories/userRepository');
const { sendSuccess } = require('../utils/sendResponse');
const sucessCodes = require('../constants/successCodes');
const errorCodes = require('../constants/errorCodes');

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await userRepository.authenticateUser(req.masterDbPool, username, password);
    if (!user || user.rows.length === 0) {
      throw {...errorCodes.INVALID_CREDENTIALS};
    }
    req.session.user = {
      id: user.rows[0].id,
      username: user.rows[0].name
    };
    sendSuccess(res, sucessCodes.LOGIN_SUCCESS, req.session.user)
  } catch (err) {
      next(err);
  }
}

exports.getFirmsForUser = async (req, res, next) => {
  try {
      const userId = req.session.user.id;
        const firms = await userRepository.getFirmsForUser(req.masterDbPool, userId);
        if (!firms || firms.rows.length === 0) {
            throw {...errorCodes.NO_FIRMS_FOR_USER};
        }
        sendSuccess(res, sucessCodes.FIRMS_FETCHED, firms.rows);
    } catch (err) {
        next(err);
    }
}

exports.logout = async (req, res) => {
  req.session.destroy(err => {
    if (err) {
      throw {...errorCodes.UNKNOWN_ERROR};
    }
    res.clearCookie('connect.sid');
    sendSuccess(res, sucessCodes.LOGOUT_SUCCESS);
  });
}