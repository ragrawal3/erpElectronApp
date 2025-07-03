const express = require('express');
const router = express.Router();
const getMasterDbPool = require('../middleware/masterDbMiddleware');

const sessionController = require('../controllers/sessionController');
const { requireLogin } = require('../middleware/middlewareChecks');

router.use(getMasterDbPool);

router.get('/', sessionController.getActiveSessions);
router.delete('/:sessionId', requireLogin, sessionController.deleteSession);

module.exports = router;