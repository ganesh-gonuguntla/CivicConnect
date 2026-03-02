// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
exports.register = async (req, res) => {
    try {
        const { name, email, password, role = 'citizen', department } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({ msg: 'Please enter all required fields' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ msg: 'Please enter a valid email address' });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({ msg: 'Password must be at least 6 characters long' });
        }

        // Validate role
        const validRoles = ['citizen', 'officer', 'admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ msg: 'Invalid role specified' });
        }

        // Check if officer role requires department
        if (role === 'officer' && !department) {
            return res.status(400).json({ msg: 'Department is required for officer role' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ msg: 'User with this email already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Prepare user data
        const userData = {
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role,
            department: role === 'officer' ? department : null,
        };

        // Create new user
        const user = new User(userData);
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Send response
        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
            },
        });
    } catch (err) {
        console.error('Register Error:', err);
        res.status(500).json({ msg: 'Server error during registration' });
    }
};

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ msg: 'Please enter email and password' });
        }

        // Find user by email (case-insensitive)
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid email or password' });
        }

        // Check password
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ msg: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Send response
        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
            },
        });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ msg: 'Server error during login' });
    }
};

/**
 * Get current user profile
 * @route GET /api/auth/me
 * @access Private
 */
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        const userObj = user.toObject();
        userObj.unreadNotifications = (userObj.notifications || []).filter(n => !n.read).length;
        res.json(userObj);
    } catch (err) {
        console.error('Get Profile Error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};

/**
 * Update current user's profile (name / password)
 * @route PUT /api/auth/update
 * @access Private
 */
exports.updateProfile = async (req, res) => {
    try {
        const { name, password } = req.body;
        const updates = {};

        if (name) updates.name = name;
        if (password) {
            if (password.length < 6) return res.status(400).json({ msg: 'Password must be at least 6 characters' });
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(password, salt);
        }

        const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
        if (!user) return res.status(404).json({ msg: 'User not found' });

        res.json({ msg: 'Profile updated', user });
    } catch (err) {
        console.error('Update Profile Error:', err);
        res.status(500).json({ msg: 'Server error while updating profile' });
    }
};

/**
 * Get notifications for current user (latest week by default)
 * @route GET /api/auth/notifications
 * @access Private
 */
exports.getNotifications = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('notifications');
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const recent = (user.notifications || [])
            .filter(n => new Date(n.createdAt) >= oneWeekAgo)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json(recent);
    } catch (err) {
        console.error('Get Notifications Error:', err);
        res.status(500).json({ msg: 'Server error while fetching notifications' });
    }
};

/**
 * Mark notifications as read for current user.
 * Accepts optional array of notification ids in body; if omitted, marks all recent (1 week) notifications as read.
 * @route PUT /api/auth/notifications/read
 * @access Private
 */
exports.markNotificationsRead = async (req, res) => {
    try {
        const { ids } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        if (Array.isArray(ids) && ids.length > 0) {
            user.notifications = user.notifications.map(n => {
                if (ids.includes(String(n._id))) {
                    return { ...n.toObject(), read: true };
                }
                return n;
            });
        } else {
            user.notifications = user.notifications.map(n => {
                if (new Date(n.createdAt) >= oneWeekAgo) return { ...n.toObject(), read: true };
                return n;
            });
        }

        await user.save();
        res.json({ msg: 'Notifications marked read' });
    } catch (err) {
        console.error('Mark Notifications Read Error:', err);
        res.status(500).json({ msg: 'Server error while updating notifications' });
    }
};
