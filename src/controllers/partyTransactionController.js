const successCodes = require('../constants/successCodes');
const partyTransactionRepository = require('../repositories/partyTransactionRepository');
const { sendSuccess } = require('../utils/sendResponse');

exports.listPartyTransactions = async (req, res, next) => {
  try {
    const result = await partyTransactionRepository.getPartyTransactions(req.firmDbPool, req.body);
    sendSuccess(res, successCodes.TRANSACTION_FETCHED, result);
  } catch (err) {
    next(err);
  }
};