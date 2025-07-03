const successCodes = require('../constants/successCodes');
const transactionRepository = require('../repositories/transactionRepository');
const { sendSuccess } = require('../utils/sendResponse');

exports.createTransaction = async (req, res, next) => {
  try {
    const result = await transactionRepository.createTransaction(req.firmDbPool, req.body);
    sendSuccess(res, successCodes.TRANSACTION_CREATED, result);
  } catch (err) {
    next(err);
  }
};

exports.getAllTransactions = async (req, res, next) => {
  try {
    const result = await transactionRepository.getAllTransactions(req.firmDbPool);
    sendSuccess(res, successCodes.TRANSACTION_FETCHED, result);
  } catch (err) {
    next(err);
  }
};


exports.getTransactionsByParty = async (req, res, next) => {
  try {
    const result = await transactionRepository.getTransactionsByParty(req.firmDbPool, req.params.id);
    sendSuccess(res, successCodes.TRANSACTION_FETCHED, result);
  } catch (err) {
    next(err);
  }
};

exports.getTransactionById = async (req, res, next) => {
  try {
    const result = await transactionRepository.getTransactionById(req.firmDbPool, req.params.id);
    sendSuccess(res, successCodes.TRANSACTION_FETCHED, result);
  } catch (err) {
    next(err);
  }
};

exports.updateTransaction = async (req, res, next) => {
  try {
    const result = await transactionRepository.updateTransaction(req.firmDbPool, req.params.id, req.body);
    sendSuccess(res, successCodes.TRANSACTION_UPDATED, result);
  } catch (err) {
    next(err);
  }
};

exports.deleteTransaction = async (req, res, next) => {
  try {
    const result = await transactionRepository.deleteTransaction(req.firmDbPool, req.params.id);
    sendSuccess(res, successCodes.TRANSACTION_DELETED, result);
  } catch (err) {
    next(err);
  }
};
