const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateJWT, authorizeRole } = require('../middleware/auth');

router.use(authenticateJWT);
router.get('/providers', authorizeRole(['admin']), userController.getProviders);

module.exports = router;
