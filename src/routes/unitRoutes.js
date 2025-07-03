const express = require('express');
const router = express.Router();
const unitController = require('../controllers/unitController');
const authMiddleware = require('../middleware/middlewareChecks');
const getfirmDbMiddleware = require('../middleware/firmDbMiddleware');

router.use(authMiddleware.requireLogin);
router.use(authMiddleware.requireFirm);
router.use(getfirmDbMiddleware);

router.get('/', unitController.getAllUnits);
router.post('/', authMiddleware.requireRole('admin'), unitController.createUnit);
router.put('/:id', authMiddleware.requireRole('admin'), unitController.updateUnit);
router.delete('/:id', authMiddleware.requireRole('admin'), unitController.deleteUnit);

module.exports = router;