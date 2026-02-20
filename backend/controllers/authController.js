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
        res.json(user);
    } catch (err) {
        console.error('Get Profile Error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};
