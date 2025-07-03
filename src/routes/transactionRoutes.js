const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middleware/middlewareChecks');
const getfirmDbMiddleware = require('../middleware/firmDbMiddleware');
const validate = require('../middleware/validateRequest');
const { createTransactionSchema, updateTransactionSchema } = require('../validators/transactionValidator');

router.use(authMiddleware.requireLogin);
router.use(authMiddleware.requireFirm); 
router.use(getfirmDbMiddleware);

router.post('/', authMiddleware.requireRole('admin'), validate(createTransactionSchema), transactionController.createTransaction);
router.get('/', authMiddleware.requireRole('admin'), transactionController.getAllTransactions);
router.get('/:id', authMiddleware.requireRole('admin'), transactionController.getTransactionById);
router.get('/party/:id', authMiddleware.requireRole('admin'), transactionController.getTransactionsByParty);
router.put('/:id', authMiddleware.requireRole('admin'), validate(updateTransactionSchema), transactionController.updateTransaction);
router.delete('/:id', authMiddleware.requireRole('admin'), transactionController.deleteTransaction);

module.exports = router;
