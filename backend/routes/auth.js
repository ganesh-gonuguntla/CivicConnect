// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', authController.register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', authController.login);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, authController.getProfile);

// @route   PUT /api/auth/update
// @desc    Update name / password for current user
// @access  Private
router.put('/update', auth, authController.updateProfile);

// @route   GET /api/auth/notifications
// @desc    Get recent notifications for current user
// @access  Private
router.get('/notifications', auth, authController.getNotifications);
router.put('/notifications/read', auth, authController.markNotificationsRead);

module.exports = router;
