const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/middlewareChecks');
const getfirmDbMiddleware = require('../middleware/firmDbMiddleware');

router.use(authMiddleware.requireLogin);
router.use(authMiddleware.requireFirm); 
router.use(getfirmDbMiddleware);

router.get('/', categoryController.getAllCategories);
router.post('/', authMiddleware.requireRole('admin'), categoryController.createCategory);
router.put('/:id', authMiddleware.requireRole('admin'), categoryController.updateCategory);
router.delete('/:id', authMiddleware.requireRole('admin'), categoryController.deleteCategory);

module.exports = router;