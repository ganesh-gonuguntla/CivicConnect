// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['citizen', 'officer', 'admin'], default: 'citizen' },
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
    ]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
