/**
 * One-time migration: sync verified field with status for all officers.
 * Run once with: node scripts/fix-officer-verified.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB...');

        // Fix approved officers whose verified is still false
        const fixed = await User.updateMany(
            { role: 'officer', status: 'approved', verified: false },
            { $set: { verified: true } }
        );
        console.log(`✅ Fixed ${fixed.modifiedCount} approved officer(s) (set verified=true)`);

        // Fix rejected officers whose verified is still true
        const fixed2 = await User.updateMany(
            { role: 'officer', status: 'rejected', verified: true },
            { $set: { verified: false } }
        );
        console.log(`✅ Fixed ${fixed2.modifiedCount} rejected officer(s) (set verified=false)`);

        await mongoose.disconnect();
        console.log('Done. You can now delete this script.');
    })
    .catch(err => {
        console.error('Error:', err.message);
        process.exit(1);
    });
