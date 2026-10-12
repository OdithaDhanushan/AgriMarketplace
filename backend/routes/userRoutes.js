const express = require('express');
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/me', requireAuth, userController.getProfile);
router.put('/me', requireAuth, userController.updateProfile);
router.delete('/me', requireAuth, userController.deleteAccount);

module.exports = router;