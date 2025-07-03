const express = require('express');
const router = express.Router();
const getMasterDbPool = require('../middleware/masterDbMiddleware');
const { requireLogin } = require('../middleware/middlewareChecks');
const firmController = require('../controllers/firmController');


router.use(getMasterDbPool);
router.use(requireLogin);

router.post('/createNewFirm', firmController.createNewFirm);
router.post('/selectFirm', firmController.selectFirm);


module.exports = router;
