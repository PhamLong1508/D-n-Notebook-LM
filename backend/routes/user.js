const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register', userController.authOptional, userController.register);
router.post('/login', userController.login);
router.get('/user', userController.auth, userController.getUser);
router.delete('/user/:id', userController.auth, userController.deleteUser);

module.exports = router; 