const Joi = require('joi');

const createPartySchema = Joi.object({
  name: Joi.string().min(2).required(),
  type: Joi.string().valid('customer', 'supplier').required(),
  phone: Joi.string().allow(null, ''),
  email: Joi.string().email().allow(null, ''),
  gstin: Joi.string().allow(null, ''),
  address: Joi.string().allow(null, ''),
  opening_balance: Joi.number().default(0),
}).min(1); // require at least one field

module.exports = {
  createPartySchema
};

exports.validateParty = (data) => {
  const { error } = schema.validate(data);
  if (error) {
    throw{...errorCodes.VALIDATION_ERROR, message: error.details[0].message};
  }
};