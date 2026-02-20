// scripts/setupDepartments.js
// Run this once to create departments and assign officers

require('dotenv').config();
const mongoose = require('mongoose');
const Department = require('../models/Department');
const User = require('../models/User');

const setupDepartments = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Define departments to create
        const departmentNames = ['Roads', 'Water', 'Sanitation', 'Electricity'];

        for (const deptName of departmentNames) {
            // Check if department already exists
            let dept = await Department.findOne({ name: deptName });

            if (!dept) {
                // Create new department
                dept = new Department({ name: deptName, officers: [] });
                await dept.save();
                console.log(`✅ Created department: ${deptName}`);
            } else {
                console.log(`ℹ️  Department already exists: ${deptName}`);
            }

            // Find all officers with this department
            const officers = await User.find({
                role: 'officer',
                department: deptName
            });

            // Assign officers to department if not already assigned
            for (const officer of officers) {
                if (!dept.officers.includes(officer._id)) {
                    dept.officers.push(officer._id);
                    console.log(`✅ Assigned officer ${officer.email} to ${deptName}`);
                }
            }

            await dept.save();
        }

        console.log('\n✅ Setup complete!');
        console.log('\nDepartment Summary:');

        const allDepts = await Department.find().populate('officers', 'name email department');
        allDepts.forEach(dept => {
            console.log(`\n📁 ${dept.name}`);
            console.log(`   Officers: ${dept.officers.length}`);
            dept.officers.forEach(officer => {
                console.log(`   - ${officer.name} (${officer.email})`);
            });
        });

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
};

setupDepartments();
