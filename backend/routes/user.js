const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, authOptional } = require('../middlewares/auth');

router.post('/register', authOptional, userController.register);
router.post('/login', userController.login);
router.get('/user', auth, userController.getUser);
router.delete('/user/:id', auth, userController.deleteUser);

module.exports = router; 