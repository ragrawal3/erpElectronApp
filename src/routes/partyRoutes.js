const express = require('express');
const router = express.Router();
const partyController = require('../controllers/partyController');
const authMiddleware = require('../middleware/middlewareChecks');
const getfirmDbMiddleware = require('../middleware/firmDbMiddleware');
const validate = require('../middleware/validateRequest');
const { createPartySchema } = require('../validators/partyValidator');

router.use(authMiddleware.requireLogin);
router.use(authMiddleware.requireFirm); 
router.use(getfirmDbMiddleware);

router.post('/', authMiddleware.requireRole('admin'), validate(createPartySchema), partyController.createParty);
router.get('/', partyController.getAllParties);
router.get('/:id', partyController.getPartyById);
router.put('/:id', authMiddleware.requireRole('admin'), validate(createPartySchema), partyController.updateParty);
router.delete('/:id', authMiddleware.requireRole('admin'), partyController.deleteParty);

module.exports = router;
