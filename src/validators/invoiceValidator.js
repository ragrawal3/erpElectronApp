const Joi = require('joi');

const invoiceItemSchema = Joi.object({
  variant_id: Joi.number().integer().required(),
  quantity: Joi.number().integer().required(),
  rate: Joi.number().precision(2).required(),
  total_amount: Joi.number().integer().required()
});

const createInvoiceSchema = Joi.object({
  party_id: Joi.number().integer().required(),
  type: Joi.string().valid('sale', 'purchase', 'sale_return', 'purchase_return').required(),
  payment_type: Joi.string().valid('cash', 'credit').required(),
  total_amount: Joi.number().precision(2).required(),
  packing_charges: Joi.number().precision(2).default(0),
  forwarding_charges: Joi.number().precision(2).default(0),
  note: Joi.string().allow('', null),
  created_by: Joi.number().integer().required(),
  items: Joi.array().items(invoiceItemSchema).min(1).required()
});

const updateInvoiceSchema = Joi.object({
  party_id: Joi.number().integer().required(),
  type: Joi.string().valid('sale', 'purchase', 'sale_return', 'purchase_return').required(),
  payment_type: Joi.string().valid('cash', 'credit').required(),
  total_amount: Joi.number().precision(2).required(),
  packing_charges: Joi.number().precision(2).default(0),
  forwarding_charges: Joi.number().precision(2).default(0),
  note: Joi.string().allow('', null),
  items: Joi.allow()
  //Joi.array().items(invoiceItemSchema).min(1).required()
});



const draftInvoiceItemSchema = Joi.object({
  variant_id: Joi.number().integer().required(),
  quantity: Joi.number().integer().required(),
  rate: Joi.number().integer().required(),
  total: Joi.number().integer().required()
});

const createDraftInvoiceSchema = Joi.object({
  draft_id: Joi.number().allow('', null),
  party_id: Joi.number().integer().required(),
  type: Joi.string().valid('sale', 'purchase', 'sale_return', 'purchase_return').required(),
  note: Joi.string().allow('', null),
  items: Joi.array().items(draftInvoiceItemSchema).min(1).required()
});


module.exports = { createInvoiceSchema, updateInvoiceSchema, createDraftInvoiceSchema };