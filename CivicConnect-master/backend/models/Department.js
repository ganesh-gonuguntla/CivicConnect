// models/Department.js
const mongoose = require('mongoose');

const deptSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    officers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Department', deptSchema);
