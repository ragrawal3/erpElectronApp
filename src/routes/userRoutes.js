const express = require('express');
const router = express.Router();
const getMasterDbPool = require('../middleware/masterDbMiddleware');

const userController = require('../controllers/userController');
const { requireLogin } = require('../middleware/middlewareChecks');

router.use(getMasterDbPool);

router.post('/login', userController.login);
router.get('/firmsForUser', requireLogin, userController.getFirmsForUser);
router.post('/logout', requireLogin, userController.logout);


module.exports = router;