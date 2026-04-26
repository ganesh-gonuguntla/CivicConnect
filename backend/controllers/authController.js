// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const https = require('https');
const User = require('../models/User');
const Department = require('../models/Department');
const { generateOTP, sendOTPEmail } = require('../config/email');

const fetchGoogleUser = (accessToken) => {
    return new Promise((resolve, reject) => {
        const req = https.request(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            },
            (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    if (res.statusCode !== 200) {
                        return reject(
                            new Error(
                                `Failed to fetch Google user info, status ${res.statusCode}`
                            )
                        );
                    }
                    try {
                        const parsed = JSON.parse(data);
                        resolve(parsed);
                    } catch (err) {
                        reject(err);
                    }
                });
            }
        );

        req.on('error', (err) => reject(err));
        req.end();
    });
};

/**
 * Register a new user (sends OTP to email)
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

        // Generate OTP
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + parseInt(process.env.OTP_EXPIRY || 10) * 60 * 1000);

        // Prepare user data
        const userData = {
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role,
            department: role === 'officer' ? department : null,
            status: role === 'officer' ? 'pending' : 'approved',
            emailVerified: false,
            otp,
            otpExpiry,
        };

        // Create new user
        const user = new User(userData);
        await user.save();

        // Send OTP email
        const emailSent = await sendOTPEmail(user.email, otp, user.name);
        if (!emailSent) {
            // Delete the user if email sending fails
            await User.findByIdAndDelete(user._id);
            return res.status(500).json({ msg: 'Failed to send OTP email. Please try again.' });
        }

        // Send response (user created but not verified yet)
        res.status(201).json({
            msg: 'Registration successful! Please check your email for OTP.',
            email: user.email,
            userId: user._id,
            requiresOTPVerification: true,
        });
    } catch (err) {
        console.error('Register Error:', err);
        res.status(500).json({ msg: 'Server error during registration' });
    }
};

/**
 * Verify OTP and complete registration
 * @route POST /api/auth/verify-otp
 * @access Public
 */
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Validate required fields
        if (!email || !otp) {
            return res.status(400).json({ msg: 'Please provide email and OTP' });
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }

        // Check if already verified
        if (user.emailVerified) {
            return res.status(400).json({ msg: 'Email already verified' });
        }

        // Check OTP
        if (user.otp !== otp) {
            return res.status(400).json({ msg: 'Invalid OTP' });
        }

        // Check OTP expiry
        if (new Date() > user.otpExpiry) {
            return res.status(400).json({ msg: 'OTP has expired. Please register again.' });
        }

        // Mark email as verified
        user.emailVerified = true;
        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Send response
        res.json({
            msg: 'Email verified successfully!',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                department: user.department,
                emailVerified: user.emailVerified,
                verified: user.verified,
            },
        });
    } catch (err) {
        console.error('Verify OTP Error:', err);
        res.status(500).json({ msg: 'Server error during OTP verification' });
    }
};

/**
 * Resend OTP to email
 * @route POST /api/auth/resend-otp
 * @access Public
 */
exports.resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ msg: 'Please provide email' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }

        if (user.emailVerified) {
            return res.status(400).json({ msg: 'Email already verified' });
        }

        // Generate new OTP
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + parseInt(process.env.OTP_EXPIRY || 10) * 60 * 1000);

        // Update user with new OTP
        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();

        // Send OTP email
        const emailSent = await sendOTPEmail(user.email, otp, user.name);
        if (!emailSent) {
            return res.status(500).json({ msg: 'Failed to send OTP email. Please try again.' });
        }

        res.json({ msg: 'OTP resent successfully. Check your email.' });
    } catch (err) {
        console.error('Resend OTP Error:', err);
        res.status(500).json({ msg: 'Server error while resending OTP' });
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

        // Check if email is verified
        if (!user.emailVerified) {
            return res.status(403).json({ 
                msg: 'Please verify your email first. Check your inbox for OTP.',
                requiresOTPVerification: true,
                email: user.email
            });
        }

        if (user.role === 'officer' && user.status === 'pending') {
            return res.status(403).json({ msg: 'Your account is waiting for admin approval' });
        }
        if (user.role === 'officer' && user.status === 'rejected') {
            return res.status(403).json({ msg: 'Your officer account request was rejected' });
        }

        user.lastLogin = new Date();
        await user.save();

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
                status: user.status,
                department: user.department,
                verified: user.verified,
            },
        });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ msg: 'Server error during login' });
    }
};

/**
 * Login or register using Google OAuth access token
 * @route POST /api/auth/google
 * @access Public
 */
exports.googleLogin = async (req, res) => {
    try {
        const { access_token: accessToken } = req.body;

        if (!accessToken) {
            return res.status(400).json({ msg: 'Missing Google access token' });
        }

        const googleUser = await fetchGoogleUser(accessToken);

        if (!googleUser || !googleUser.email) {
            return res
                .status(400)
                .json({ msg: 'Unable to retrieve Google account email' });
        }

        if (googleUser.email_verified === false) {
            return res
                .status(400)
                .json({ msg: 'Google email is not verified' });
        }

        const email = googleUser.email.toLowerCase();
        let user = await User.findOne({ email });

        if (!user) {
            const randomPassword = Math.random().toString(36).slice(-12);
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(randomPassword, salt);

            user = new User({
                name: googleUser.name || googleUser.given_name || 'Google User',
                email,
                password: hashedPassword,
                role: 'citizen',
                department: null,
                lastLogin: new Date(),
            });

            await user.save();
        } else {
            user.lastLogin = new Date();
            await user.save();
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                department: user.department,
            },
        });
    } catch (err) {
        console.error('Google Login Error:', err);
        res.status(500).json({ msg: 'Server error during Google login' });
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

/**
 * Get global leaderboard (top 10 citizens worldwide) and current user's rank
 * @route GET /api/auth/leaderboard
 * @access Private
 */
exports.getLeaderboard = async (req, res) => {
    try {
        const topUsers = await User.find({ role: 'citizen' })
            .sort({ coins: -1 })
            .limit(10)
            .select('name coins role');
        
        const currentUser = await User.findById(req.user.id);
        if (!currentUser) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const higherCoinsCount = await User.countDocuments({
            role: 'citizen',
            coins: { $gt: currentUser.coins }
        });

        // For users with SAME coins, to handle ties accurately, we'd need a more complex query.
        // For now, this estimates the rank reasonably well.
        const currentUserRank = higherCoinsCount + 1;

        res.json({
            top10: topUsers,
            currentUser: {
                id: currentUser._id,
                name: currentUser.name,
                coins: currentUser.coins,
                rank: currentUserRank
            }
        });
    } catch (err) {
        console.error('Get Leaderboard Error:', err);
        res.status(500).json({ msg: 'Server error while fetching leaderboard' });
    }
};

/**
 * Admin: Get all pending officers
 * @route GET /api/auth/officers/pending
 * @access Private (admin)
 */
exports.getPendingOfficers = async (req, res) => {
    try {
        const officers = await User.find({ role: 'officer', status: 'pending' }).select('-password');
        res.json(officers);
    } catch (err) {
        console.error('Get Pending Officers Error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};

/**
 * Admin: Update officer status
 * @route PUT /api/auth/officers/:id/status
 * @access Private (admin)
 */
exports.updateOfficerStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ msg: 'Invalid status' });
        }

        // Keep both approval fields in sync:
        // - status  → checked by login controller
        // - verified → checked by auth middleware on every request
        const updateFields = {
            status,
            verified: status === 'approved'   // true when approved, false when rejected
        };

        const officer = await User.findOneAndUpdate(
            { _id: req.params.id, role: 'officer' },
            updateFields,
            { new: true }
        ).select('-password');

        if (!officer) {
            return res.status(404).json({ msg: 'Officer not found' });
        }

        // When approving: ensure officer is in their Department's officers list
        if (status === 'approved' && officer.department) {
            await Department.findOneAndUpdate(
                { name: officer.department },
                { $addToSet: { officers: officer._id } }, // addToSet = no duplicates
                { upsert: true, new: true }               // create dept doc if missing
            );
            console.log(`[Dept Sync] Officer ${officer.name} added to ${officer.department} dept`);
        }

        // When rejecting: remove officer from Department
        if (status === 'rejected' && officer.department) {
            await Department.findOneAndUpdate(
                { name: officer.department },
                { $pull: { officers: officer._id } }
            );
        }

        res.json({ msg: `Officer ${status} successfully`, officer });
    } catch (err) {
        console.error('Update Officer Status Error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};
