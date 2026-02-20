// models/Issue.js
const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageURL: { type: String }, // Cloudinary URL
    category: {
        type: String,
        required: true,
        enum: ['Roads', 'Water', 'Sanitation', 'Electricity']
    },
    department: {
        type: String,
        enum: ['Roads', 'Water', 'Sanitation', 'Electricity', 'General'],
        default: 'General'
    },
    location: {
        lat: { type: Number },
        lng: { type: Number },
        address: { type: String }
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Resolved'],
        default: 'Pending'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedOfficer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    comments: [{
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: { type: String },
        at: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Issue', issueSchema);
