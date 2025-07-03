const express = require('express');
const router = express.Router();
const productVariantController = require('../controllers/productVariantController');
const authMiddleware = require('../middleware/middlewareChecks');
const getfirmDbMiddleware = require('../middleware/firmDbMiddleware');

router.use(authMiddleware.requireLogin);
router.use(authMiddleware.requireFirm); 
router.use(getfirmDbMiddleware);

router.get('', productVariantController.getAttributeNameValue);
router.get('/product/:productId', productVariantController.getVariantsForProduct);
router.post('/', authMiddleware.requireRole('admin'), productVariantController.createProductVariant);
router.put('/:id', authMiddleware.requireRole('admin'), productVariantController.updateProductVariant);

module.exports = router;