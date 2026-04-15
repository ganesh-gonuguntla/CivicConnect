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
<<<<<<< HEAD
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
=======
    // Admin must verify officers before they can access the system
    verified: { type: Boolean, default: false }
>>>>>>> a5355e05bb98d623a8c4f8a86aadf81c47108b0a
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
