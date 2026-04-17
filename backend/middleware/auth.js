const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
        const token = authHeader.split(' ')[1]; // "Bearer <token>"
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach minimal info
        req.user = { id: decoded.id, role: decoded.role };

        // Fetch full user object
        const user = await User.findById(decoded.id).select('-password');
        if (!user) return res.status(401).json({ msg: 'User not found' });

        // Block unverified officers — only admin can verify them
        if (user.role === 'officer' && !user.verified) {
            return res.status(403).json({ msg: 'Officer not verified by admin. Please contact the administrator.' });
        }

        req.currentUser = user; // backward compatibility
        next();
    } catch (err) {
        console.error('JWT Error:', err.message);
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

const permit = (...roles) => (req, res, next) => {
    if (!req.user) return res.status(401).json({ msg: 'Unauthorized' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ msg: 'Forbidden' });
    next();
};

const approvedOfficer = (req, res, next) => {
    if (!req.currentUser) return res.status(401).json({ msg: 'Unauthorized' });
    if (req.currentUser.role === 'officer' && req.currentUser.status !== 'approved') {
        return res.status(403).json({ msg: 'Your account is waiting for admin approval' });
    }
    next();
};

module.exports = { auth, permit, approvedOfficer };
