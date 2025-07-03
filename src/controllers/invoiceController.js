const invoiceRepository = require('../repositories/invoiceRepository');
const successCodes = require('../constants/successCodes');
const { sendSuccess } = require('../utils/sendResponse');

exports.createInvoice = async (req, res, next) => {
  try {
    const result = await invoiceRepository.createInvoice(req.firmDbPool, req.body);
    sendSuccess(res, successCodes.PARTY_CREATED, result);
  } catch (err) {
    next(err);
  }
};

exports.getInvoices = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page -1) * limit;

    const { type, party_id, } = req.query;

  try {
    const result = await invoiceRepository.getInvoices({ type, party_id, offset, limit }, req.firmDbPool);
    sendSuccess(res, successCodes.PARTY_LIST_FETCHED, {
      invoices: result.invoices,
      pagination: {
        total: result.total,
        page: page,
        limit: limit,
        pages: Math.ceil(result.total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getInvoiceById = async (req, res, next) => {
  try {
    const result = await invoiceRepository.getInvoiceById(req.firmDbPool, parseInt(req.params.id));
    sendSuccess(res, successCodes.PARTY_FETCHED, result);
  } catch (err) {
    next(err);
  }
};

exports.updateInvoice = async (req, res, next) => {
  try {
    const result = await invoiceRepository.alterInvoiceDetails(req.firmDbPool, req.params.id, req.body);
    sendSuccess(res, successCodes.PARTY_UPDATED, result);
  } catch (err) {
    next(err);
  }
};

exports.deleteInvoice = async (req, res, next) => {
  try {
    const result = await invoiceRepository.deleteInvoice(req.firmDbPool, req.params.id);
    sendSuccess(res, successCodes.PARTY_DELETED, result);
  } catch (err) {
    next(err);
  }
};
