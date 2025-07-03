const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const authMiddleware = require('../middleware/middlewareChecks');
const getfirmDbMiddleware = require('../middleware/firmDbMiddleware');
const validate = require('../middleware/validateRequest');
const { createInvoiceSchema, updateInvoiceSchema } = require('../validators/invoiceValidator');

router.use(authMiddleware.requireLogin);
router.use(authMiddleware.requireFirm); 
router.use(getfirmDbMiddleware);

router.post('/', authMiddleware.requireRole('admin'), validate(createInvoiceSchema), invoiceController.createInvoice);
router.get('/', invoiceController.getInvoices);
router.get('/:id', invoiceController.getInvoiceById);
router.put('/:id', authMiddleware.requireRole('admin'), validate(updateInvoiceSchema), invoiceController.updateInvoice);
//router.delete('/:id', authMiddleware.requireRole('admin'), invoiceController.deleteParty);

module.exports = router;
