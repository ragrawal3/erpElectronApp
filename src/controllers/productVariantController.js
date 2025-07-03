const variantReopsitory = require('../repositories/productVariantRepository');
const successCodes = require('../constants/successCodes');
const { sendSuccess } = require('../utils/sendResponse');

exports.getAttributeNameValue = async (req, res) => {
    const db = req.firmDbPool;
    const attributes = await variantReopsitory.getAttributeNameValue(db);
    sendSuccess(res, successCodes.ATTRIBUTES_FETCHED, attributes);
};

exports.getVariantsForProduct = async (req, res) => {
    const productId = req.params.productId;
    const db = req.firmDbPool;
    const variants = await variantReopsitory.getVariantsForProduct(db, productId);
    sendSuccess(res, successCodes.VARRIANTS_FETCHED, variants);
};

exports.createProductVariant = async (req, res) => {
    const db = req.firmDbPool;
    const productId = req.body.product_id
    for (const variant of req.body.variants) {
        const result = await variantReopsitory.createProductVariant(false, db, productId, variant);
    }
    sendSuccess(res, successCodes.VARRIANTS_CREATED, result);
};

exports.updateProductVariant = async (req, res) => {
    const db = req.firmDbPool;
    const variantId = req.params.id;
    const updatedVariant = await variantReopsitory.updateProductVariant(db, variantId, req.body);
    sendSuccess(res, successCodes.VARRIANTS_UPDATED, updatedVariant);
};