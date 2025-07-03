const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const upload = require('../utils/upload');

const authMiddleware = require('../middleware/middlewareChecks');
const getfirmDbMiddleware = require('../middleware/firmDbMiddleware');


router.use(authMiddleware.requireLogin);
router.use(authMiddleware.requireFirm); 
router.use(getfirmDbMiddleware);

//Routes for product management
router.get('/getAllProducts', productController.getAllProducts);
router.get('/', productController.getProductList);
router.get('/:id', productController.getProductById);
router.post('/', authMiddleware.requireRole('admin'), productController.createProduct);
router.put('/:id', authMiddleware.requireRole('admin'), productController.updateProduct);
router.delete('/:id', authMiddleware.requireRole('admin'), productController.deleteProduct);

router.get('/:productId/images', productController.getProductImages);
router.post('/:productId/images', authMiddleware.requireRole('admin'), upload.array('images', 5), productController.uploadProductImage);
router.delete('/:productId/images/:imageId', authMiddleware.requireRole('admin'), productController.deleteImageById);

module.exports = router;