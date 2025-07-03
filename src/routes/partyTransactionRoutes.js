const express = require('express');
const router = express.Router();
const partyTransactionController = require('../controllers/partyTransactionController');
const authMiddleware = require('../middleware/middlewareChecks');
const getfirmDbMiddleware = require('../middleware/firmDbMiddleware');

router.use(authMiddleware.requireLogin);
router.use(authMiddleware.requireFirm); 
router.use(getfirmDbMiddleware);

router.get('/', authMiddleware.requireRole('admin'), partyTransactionController.listPartyTransactions);

module.exports = router;
