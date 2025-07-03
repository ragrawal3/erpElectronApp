const express = require('express');
const router = express.Router();
const draftInvoiceController = require('../controllers/draftInvoiceController');
const authMiddleware = require('../middleware/middlewareChecks');
const getfirmDbMiddleware = require('../middleware/firmDbMiddleware');
const validate = require('../middleware/validateRequest');
const { createDraftInvoiceSchema } = require('../validators/invoiceValidator');

router.use(authMiddleware.requireLogin);
router.use(authMiddleware.requireFirm); 
router.use(getfirmDbMiddleware);


// Create/auto-save
router.post('/', authMiddleware.requireRole('admin'), validate(createDraftInvoiceSchema), draftInvoiceController.createOrUpdateDraftInvoice);
//router.get('/', draftInvoiceController.getAllDraftInvoices);
router.get('/:id', draftInvoiceController.getDraftInvoiceById);
router.put('/:id', authMiddleware.requireRole('admin'), validate(createDraftInvoiceSchema), draftInvoiceController.updateDraftInvoice);
router.post('/finalize/:draftId', authMiddleware.requireRole('admin'), draftInvoiceController.finalizeDraftInvoice);
//router.delete('/:id', authMiddleware.requireRole('admin'), invoiceController.deleteParty);

module.exports = router;
