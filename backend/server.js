require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');
const issueRoutes = require('./routes/issues');
const deptRoutes = require('./routes/departments');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/departments', deptRoutes);

// Test route
app.get('/', (req, res) => {
    res.send('CivicConnect API running');
});

const PORT = process.env.PORT || 5000;

// ✅ Clean mongoose connection block
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });
