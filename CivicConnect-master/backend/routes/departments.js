// routes/departments.js
const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const User = require('../models/User');
const { auth, permit } = require('../middleware/auth');

// Create department (admin)
router.post('/', auth, permit('admin'), async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ msg: 'Name required' });

        const exists = await Department.findOne({ name });
        if (exists) return res.status(400).json({ msg: 'Department exists' });

        const dept = new Department({ name });
        await dept.save();
        res.status(201).json(dept);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// List departments (public)
router.get('/', auth, async (req, res) => {
    try {
        const depts = await Department.find().populate('officers', 'name email department');
        res.json(depts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Assign an officer to a department (admin)
router.post('/:deptId/assign/:userId', auth, permit('admin'), async (req, res) => {
    try {
        const { deptId, userId } = req.params;
        const dept = await Department.findById(deptId);
        const user = await User.findById(userId);
        if (!dept || !user) return res.status(404).json({ msg: 'Not found' });

        // add to dept officers if not present
        if (!dept.officers.includes(userId)) dept.officers.push(userId);
        // set user's department field
        user.department = dept.name;
        await dept.save();
        await user.save();

        res.json({ dept, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
