const draftInvoiceRepository = require('../repositories/draftInvoiceRepository');
const successCodes = require('../constants/successCodes');
const { sendSuccess } = require('../utils/sendResponse');

exports.createOrUpdateDraftInvoice = async (req, res, next) => {
  try {
    const result = await draftInvoiceRepository.createOrUpdateDraftInvoice(req.firmDbPool, req.session.user.id, req.body);
    sendSuccess(res, successCodes.PARTY_CREATED, result);
  } catch (err) {
    next(err);
  }
};

exports.getDraftInvoiceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await draftInvoiceRepository.getDraftInvoiceById(req.firmDbPool, id);
    sendSuccess(res, successCodes.PARTY_CREATED, result);
  } catch (err) {
    next(err);
  }
};

exports.updateDraftInvoice = async (req, res, next) => {
  try {
    const { inv_id } = req.params;

    const result = await draftInvoiceRepository.updateDraftInvoiceById(req.firmDbPool, inv_id, req.body, req.session.user.id);
    sendSuccess(res, successCodes.PARTY_CREATED, result);
  } catch (err) {
    next(err);
  }
};

exports.finalizeDraftInvoice = async (req, res, next) => {
  try {
    const { draftId } = req.params;
    
    const result = await draftInvoiceRepository.finalizeDraftInvoice(req.firmDbPool, draftId);
    sendSuccess(res, successCodes.PARTY_CREATED, result);
  } catch (err) {
    next(err);
  }
};