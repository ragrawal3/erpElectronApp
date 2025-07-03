const productRepository = require('../repositories/productRepository');
const { sendSuccess } = require('../utils/sendResponse');
const sucessCodes = require('../constants/successCodes');

exports.getAllProducts = async (req, res) => {
  const db = req.firmDbPool;
  const products = await productRepository.getAllProducts(db);
  sendSuccess(res, sucessCodes.PRODUCT_FETCHED, products);
};

exports.getProductList = async (req, res) => {
  const db = req.firmDbPool;
  const { search, categoryId, unitId } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limits) || 10;
  const offset = (page - 1) * limit;
  
  const products = await productRepository.listProducts(
    { search, categoryId, unitId, limit, offset },
    db
  );
  // Optional: add a count query if you want total pages
  res.json({
    products,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: null // add later if needed
    }
  });
};

exports.getProductById = async (req, res) => {
  const productId = req.params.id;
  const db = req.firmDbPool;
  const product = await productRepository.getProductById(db, productId);
  sendSuccess(res, sucessCodes.PRODUCT_FETCHED, product);
};

exports.createProduct = async (req, res) => {
  const db = req.firmDbPool;
  const result = await productRepository.createProduct(db, req.body);
  sendSuccess(res, sucessCodes.PRODUCT_CREATED, result);
};

exports.updateProduct = async (req, res) => {
  const db = req.firmDbPool;
  const productId = req.params.id;
  // ToDo id can be in req.body or req.params, depending on your API design
  const result = await productRepository.updateProduct(db, productId, req.body);
  sendSuccess(res, sucessCodes.PRODUCT_UPDATED, result);
};

exports.deleteProduct = async (req, res) => {
  const db = req.firmDbPool;
  const productId = req.params.id;
  const result = await productRepository.deleteProduct(db, productId);
  sendSuccess(res, sucessCodes.PRODUCT_DELETED, result);
};

exports.getProductImages = async (req, res) => {
  const db = req.firmDbPool;
  const productId = req.params.productId;
  
  const result = await productRepository.getProductImages(db, productId);
  // ToDo Modify when stored moved to cloud
  const baseUrl = `${req.protocol}://${req.get("host")}/uploads/products`;

  const images = result.map((img) => ({
    "id": img.id,
    "is_primary": img.is_primary,
    "uploaded_at": img.uploaded_at,
    url: `${baseUrl}/${img.file_name}`
  }));
  sendSuccess(res, sucessCodes.IMAGE_FETCHED, images);
};

exports.uploadProductImage = async (req, res) => {
  const db = req.firmDbPool;
  const productId = req.params.productId;
  const files = req.files;
  
  // Assuming 'path' is the field where multer stores the file path
  const result = await productRepository.uploadProductImage(db, productId, files);
  sendSuccess(res, sucessCodes.IMAGE_UPLOADED, result);
};

exports.deleteImageById = async (req, res, next) => {
  const db = req.firmDbPool;
  const productId = req.params.productId;
  const imageId = req.params.imageId;
  
  // Assuming 'path' is the field where multer stores the file path
  const result = await productRepository.deleteProductImageById(db, productId, imageId);
  sendSuccess(res, sucessCodes.IMAGE_DELETED, result);
};