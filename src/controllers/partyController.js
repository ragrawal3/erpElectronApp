const partyRepository = require('../repositories/partyRepository');
const successCodes = require('../constants/successCodes');
const { sendSuccess } = require('../utils/sendResponse');

exports.createParty = async (req, res, next) => {
  try {
    const result = await partyRepository.createParty(req.firmDbPool, req.body);
    sendSuccess(res, successCodes.PARTY_CREATED, result);
  } catch (err) {
    next(err);
  }
};

exports.getAllParties = async (req, res, next) => {
  try {
    const result = await partyRepository.getAllParties(req.firmDbPool);
    sendSuccess(res, successCodes.PARTY_LIST_FETCHED, result);
  } catch (err) {
    next(err);
  }
};

exports.getPartyById = async (req, res, next) => {
  try {
    const result = await partyRepository.getPartyById(req.firmDbPool, req.params.id);
    sendSuccess(res, successCodes.PARTY_FETCHED, result);
  } catch (err) {
    next(err);
  }
};

exports.updateParty = async (req, res, next) => {
  try {
    const result = await partyRepository.updateParty(req.firmDbPool, req.params.id, req.body);
    sendSuccess(res, successCodes.PARTY_UPDATED, result);
  } catch (err) {
    next(err);
  }
};

exports.deleteParty = async (req, res, next) => {
  try {
    const result = await partyRepository.deleteParty(req.firmDbPool, req.params.id);
    sendSuccess(res, successCodes.PARTY_DELETED, result);
  } catch (err) {
    next(err);
  }
};
