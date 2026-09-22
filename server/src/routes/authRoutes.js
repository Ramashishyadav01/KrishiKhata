const express = require('express');
const router = express.Router();
const { login, register, resetPassword, getMe, getUsers, createUser, updateUserStatus, deleteUser } = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);
router.get('/users', protect, adminOnly, getUsers);
router.post('/users', protect, adminOnly, createUser);
router.put('/users/:id/status', protect, adminOnly, updateUserStatus);
router.delete('/users/:id', protect, adminOnly, deleteUser);

module.exports = router;
