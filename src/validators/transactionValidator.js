const Joi = require('joi');

const createTransactionSchema = Joi.object({
  party_id: Joi.number().integer().required(),
  amount: Joi.number().positive().required(),
  type: Joi.string().valid('sale', 'purchase', 'returns', 'payment', 'receipt', 'adjustment').required(),
  mode: Joi.string().valid('cash', 'bank', 'upi', 'other').required(),
  note: Joi.string().allow('', null).optional(),
  invoice_id: Joi.when('type', {
        is: Joi.string().valid('sale', 'purchase', 'returns'),
        then: Joi.number().integer().required(),
        otherwise: Joi.string().allow('', null).optional(),
    }),
});

const updateTransactionSchema = Joi.object({
  amount: Joi.number().positive().required(),
  type: Joi.string().valid('sale', 'purchase', 'returns', 'payment', 'receipt', 'adjustment').required(),
  mode: Joi.string().valid('cash', 'bank', 'upi', 'other').required(),
  note: Joi.string().allow('', null).optional(),
}).min(1); // require at least one field

module.exports = {
  createTransactionSchema,
  updateTransactionSchema
};