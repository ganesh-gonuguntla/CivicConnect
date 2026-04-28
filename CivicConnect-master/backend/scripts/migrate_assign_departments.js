// scripts/migrate_assign_departments.js
// Migration script to assign departments to existing issues based on their category

require('dotenv').config();
const mongoose = require('mongoose');
const Issue = require('../models/Issue');

// Department mapping (same as in issueController)
const getDepartmentFromCategory = (category) => {
    const departmentMap = {
        'Roads': 'Roads',
        'Sanitation': 'Sanitation',
        'Water': 'Water',
        'Electricity': 'Electricity'
    };

    return departmentMap[category] || 'General';
};

const migrateDepartments = async () => {
    try {
        console.log('🔄 Starting department assignment migration...\n');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Find all issues without department or with "General" department
        const issuesNeedingUpdate = await Issue.find({
            $or: [
                { department: { $exists: false } },
                { department: null },
                { department: 'General' }
            ]
        });

        console.log(`📊 Found ${issuesNeedingUpdate.length} issues needing department assignment\n`);

        if (issuesNeedingUpdate.length === 0) {
            console.log('✅ All issues already have proper departments assigned!');
            process.exit(0);
        }

        let updatedCount = 0;
        const sampleUpdates = [];

        for (const issue of issuesNeedingUpdate) {
            const oldDept = issue.department;
            const newDept = getDepartmentFromCategory(issue.category);

            // Update department
            issue.department = newDept;
            await issue.save();

            updatedCount++;

            // Store first 5 updates as sample
            if (sampleUpdates.length < 5) {
                sampleUpdates.push({
                    id: issue._id,
                    title: issue.title,
                    category: issue.category,
                    oldDept: oldDept || 'none',
                    newDept: newDept
                });
            }
        }

        console.log('\n✅ Migration completed successfully!\n');
        console.log('📈 Summary:');
        console.log(`   - Total processed: ${issuesNeedingUpdate.length}`);
        console.log(`   - Successfully updated: ${updatedCount}`);

        if (sampleUpdates.length > 0) {
            console.log('\n📝 Sample of updated issues:');
            sampleUpdates.forEach((update, index) => {
                console.log(`   ${index + 1}. "${update.title}"`);
                console.log(`      Category: ${update.category}`);
                console.log(`      Department: ${update.oldDept} → ${update.newDept}`);
            });
        }

        console.log('\n🎉 All done!');
        process.exit(0);

    } catch (err) {
        console.error('\n❌ Migration failed:', err.message);
        console.error('Error details:', err);
        process.exit(1);
    }
};

// Run migration
migrateDepartments();
