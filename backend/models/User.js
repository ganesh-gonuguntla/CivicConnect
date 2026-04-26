// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['citizen', 'officer', 'admin'], default: 'citizen' },
    status: { type: String, enum: ['approved', 'pending', 'rejected'], default: 'approved' },
    department: {
        type: String,
        enum: ['Roads', 'Water', 'Sanitation', 'Electricity', null],
        default: null
    },
    lastLogin: { type: Date, default: null },
    coins: { type: Number, default: 0 },
    notifications: [
        {
            message: { type: String },
            type: { type: String },
            createdAt: { type: Date, default: Date.now },
            read: { type: Boolean, default: false },
            meta: { type: Object, default: {} }
        }
    ],
    // Admin must verify officers before they can access the system
    verified: { type: Boolean, default: false },
    // Email verification via OTP
    emailVerified: { type: Boolean, default: false },
    otp: { type: String, default: null },
    otpExpiry: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
