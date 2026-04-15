// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth, permit } = require('../middleware/auth');

/**
 * @route   GET /api/users/officers
 * @desc    Get all officers (with verification status) — admin only
 * @access  Private (admin)
 */
router.get('/officers', auth, permit('admin'), async (req, res) => {
    try {
        const officers = await User.find({ role: 'officer' }).select('-password');
        res.json(officers);
    } catch (err) {
        console.error('Get Officers Error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

/**
 * @route   PUT /api/users/:id/verify
 * @desc    Verify an officer — admin only
 * @access  Private (admin)
 */
router.put('/:id/verify', auth, permit('admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if (user.role !== 'officer') {
            return res.status(400).json({ msg: 'Only officers can be verified' });
        }

        if (user.verified) {
            return res.status(400).json({ msg: 'Officer is already verified' });
        }

        user.verified = true;
        await user.save();

        res.json({
            msg: `Officer ${user.name} has been verified successfully`,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                verified: user.verified,
            },
        });
    } catch (err) {
        console.error('Verify Officer Error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

/**
 * @route   PUT /api/users/:id/unverify
 * @desc    Revoke officer verification — admin only
 * @access  Private (admin)
 */
router.put('/:id/unverify', auth, permit('admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if (user.role !== 'officer') {
            return res.status(400).json({ msg: 'Only officers can be unverified' });
        }

        user.verified = false;
        await user.save();

        res.json({
            msg: `Officer ${user.name} verification has been revoked`,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                verified: user.verified,
            },
        });
    } catch (err) {
        console.error('Unverify Officer Error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
