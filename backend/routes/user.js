const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, authOptional } = require('../middlewares/auth');
const { adminAuth } = require('../middlewares/adminAuth');

router.post('/register', authOptional, userController.register);
router.post('/login', userController.login);
router.get('/user', auth, userController.getUser);
router.put('/user/profile', auth, userController.updateProfile);
router.put('/user/password', auth, userController.changePassword);

// Admin routes
router.post('/admin/users', auth, adminAuth, userController.addUser);
router.get('/admin/users', auth, adminAuth, userController.getAllUsers);
router.put('/admin/users/:id', auth, adminAuth, userController.updateUser);
router.delete('/admin/users/:id', auth, adminAuth, userController.deleteUser);
router.get('/admin/statistics', auth, adminAuth, userController.getStatistics);

module.exports = router; 