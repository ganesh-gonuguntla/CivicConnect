// models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    issueId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Issue',
        required: true,
        index: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['text', 'image', 'video'],
        default: 'text'
    },
    text: { type: String, default: '' },
    mediaURL: { type: String, default: '' },
    editedAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    readAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
