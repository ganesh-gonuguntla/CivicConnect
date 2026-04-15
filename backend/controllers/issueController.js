// controllers/issueController.js
const Issue = require('../models/Issue');
const Department = require('../models/Department');
const cloudinary = require('../config/cloudinary');

// Department mapping helper
const getDepartmentFromCategory = (category) => {
    const departmentMap = {
        'Roads': 'Roads',
        'Sanitation': 'Sanitation',
        'Water': 'Water',
        'Electricity': 'Electricity'
    };

    const department = departmentMap[category];
    if (!department) {
        console.warn(`Unknown category "${category}", using fallback department "General"`);
        return 'General';
    }
    return department;
};

/**
 * Upload image to Cloudinary
 * @param {Buffer} fileBuffer - File buffer from multer
 * @returns {Promise<string>} - Cloudinary URL
 */
const uploadToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'civicconnect',
                resource_type: 'image'
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result.secure_url);
                }
            }
        );
        uploadStream.end(fileBuffer);
    });
};

/**
 * Create a new issue
 * @route POST /api/issues
 * @access Private (citizen, admin)
 */
exports.createIssue = async (req, res) => {
    try {
        const { title, description, category, location } = req.body;

        // Validate required fields
        if (!title || !description || !category) {
            return res.status(400).json({ msg: 'Please provide title, description, and category' });
        }

        // Parse location JSON
        let parsedLocation = {
            lat: null,
            lng: null,
            address: null
        };

        if (location) {
            try {
                const locationObj = JSON.parse(location);
                parsedLocation = {
                    lat: locationObj.lat ? parseFloat(locationObj.lat) : null,
                    lng: locationObj.lng ? parseFloat(locationObj.lng) : null,
                    address: locationObj.address || null
                };
            } catch (e) {
                console.error('Error parsing location:', e);
            }
        }

        // Map category to department
        const department = getDepartmentFromCategory(category);

        // Upload image to Cloudinary if provided
        let imageURL = '';
        if (req.file) {
            try {
                imageURL = await uploadToCloudinary(req.file.buffer);
            } catch (uploadError) {
                console.error('Cloudinary Upload Error:', uploadError);
                return res.status(500).json({ msg: 'Failed to upload image' });
            }
        }

        // Auto-assign officer from department
        const dept = await Department.findOne({ name: department }).populate('officers');

        let assignedOfficer = null;
        if (dept && dept.officers && dept.officers.length > 0) {
            // Randomly assign to an officer in the department
            const randomIndex = Math.floor(Math.random() * dept.officers.length);
            assignedOfficer = dept.officers[randomIndex]._id;
        }

        // Create issue
        const issue = new Issue({
            title,
            description,
            imageURL,
            category,
            department,  // Set department from category mapping
            location: parsedLocation,
            createdBy: req.user.id,
            assignedOfficer,
        });

        await issue.save();

        // Populate and return
        const populatedIssue = await Issue.findById(issue._id)
            .populate('createdBy', 'name email')
            .populate('assignedOfficer', 'name email department');

        // Award coins for creating an issue (100 coins)
        try {
            if (!issue.coinsAwarded.reported) {
                const User = require('../models/User');
                await User.findByIdAndUpdate(req.user.id, {
                    $inc: { coins: 100 },
                    $push: {
                        notifications: {
                            message: `You earned 100 Civic Points for reporting: ${issue.title}`,
                            type: 'coins',
                            meta: { issueId: issue._id }
                        }
                    }
                });
                issue.coinsAwarded.reported = true;
                await issue.save();
            }
        } catch (coinErr) {
            console.error('Error awarding coins on report:', coinErr);
        }

        res.status(201).json({
            msg: 'Issue created successfully',
            issue: populatedIssue
        });
    } catch (err) {
        console.error('Create Issue Error:', err);
        res.status(500).json({ msg: 'Server error while creating issue' });
    }
};

/**
 * Get issues assigned to officer's department
 * @route GET /api/issues/assigned
 * @access Private (officer only)
 */
exports.getAssignedIssues = async (req, res) => {
    try {
        console.log("req.user:", req.user);

        const officerDept = req.currentUser.department; // ✅ correct source

        if (!officerDept) {
            console.warn("Officer has no department:", req.currentUser);
            return res.status(400).json({ msg: "No department assigned" });
        }

        const issues = await Issue.find({ department: officerDept })
            .populate("createdBy", "name email")
            .populate("assignedOfficer", "name email department")
            .sort({ createdAt: -1 });

        console.log("Found issues:", issues.length);
        res.json(issues);
    } catch (err) {
        console.error("Get Assigned Issues Error:", err);
        res.status(500).json({ msg: "Server error while fetching issue", error: err.message });
    }
};




/**
 * Get all issues (with role-based filtering)
 * @route GET /api/issues
 * @access Private
 */
/**
 * Get all issues (with role-based filtering)
 * @route GET /api/issues
 * @access Private
 */
exports.getIssues = async (req, res) => {
    try {
        const { status, category } = req.query;
        const role = req.user.role;
        const query = {};

        // Apply filters
        if (status) query.status = status;
        if (category) query.category = category;

        // Role-based filtering
        if (role === 'citizen') {
            // Citizens see only their own issues
            query.createdBy = req.user.id;
        } else if (role === 'officer') {
            // Officers see issues in their department
            const officerDept = req.currentUser.department; // ✅ use currentUser
            if (officerDept) {
                query.department = officerDept;
            } else {
                // Fallback: issues assigned directly to them
                query.assignedOfficer = req.user.id;
            }
        }

        // Admin sees all issues (no additional filter)

        const issues = await Issue.find(query)
            .populate('createdBy', 'name email')
            .populate('assignedOfficer', 'name email department')
            .sort({ createdAt: -1 });

        res.json(issues);
    } catch (err) {
        console.error('Get Issues Error:', err);
        res.status(500).json({ msg: 'Server error while fetching issues', error: err.message });
    }
};


/**
 * Get issues created by current user
 * @route GET /api/issues/my
 * @access Private (citizen)
 */
exports.getMyIssues = async (req, res) => {
    try {
        const issues = await Issue.find({ createdBy: req.user.id })
            .populate('assignedOfficer', 'name email department')
            .sort({ createdAt: -1 });

        res.json(issues);
    } catch (err) {
        console.error('Get My Issues Error:', err);
        res.status(500).json({ msg: 'Server error while fetching your issues' });
    }
};

/**
 * Get all issues (admin only)
 * @route GET /api/issues/all
 * @access Private (admin)
 */
exports.getAllIssues = async (req, res) => {
    try {
        const issues = await Issue.find()
            .populate('createdBy', 'name email')
            .populate('assignedOfficer', 'name email department')
            .sort({ createdAt: -1 });

        res.json(issues);
    } catch (err) {
        console.error('Get All Issues Error:', err);
        res.status(500).json({ msg: 'Server error while fetching all issues' });
    }
};

/**
 * Get single issue by ID
 * @route GET /api/issues/:id
 * @access Private
 */
exports.getIssueById = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('assignedOfficer', 'name email department')
            .populate('comments.by', 'name email');

        if (!issue) {
            return res.status(404).json({ msg: 'Issue not found' });
        }

        // Check permissions
        const role = req.user.role;
        if (role === 'citizen' && issue.createdBy._id.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'You can only view your own issues' });
        }

        res.json(issue);
    } catch (err) {
        console.error('Get Issue By ID Error:', err);
        res.status(500).json({ msg: 'Server error while fetching issue' });
    }
};

/**
 * Update issue status and add comments
 * @route PUT /api/issues/:id/status
 * @access Private (officer, admin)
 */
exports.updateIssueStatus = async (req, res) => {
    try {
        const { status, comment } = req.body;

        // Validate status value
        const validStatuses = ['Pending', 'In Progress', 'Resolved'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                msg: 'Invalid status. Must be one of: Pending, In Progress, Resolved'
            });
        }

        // Find issue
        const issue = await Issue.findById(req.params.id);
        if (!issue) {
            return res.status(404).json({ msg: 'Issue not found' });
        }

        const prevStatus = issue.status;

        // No-op: same status
        if (prevStatus === status) {
            return res.status(200).json({ msg: 'Status is already ' + status, issue });
        }

        // Block updates on already-resolved issues
        if (prevStatus === 'Resolved') {
            return res.status(400).json({ msg: 'This issue is already resolved and cannot be updated further.' });
        }

        // Enforce forward-only transition: Pending → In Progress → Resolved
        const allowedTransitions = {
            'Pending':     'In Progress',
            'In Progress': 'Resolved',
        };

        if (allowedTransitions[prevStatus] !== status) {
            return res.status(400).json({
                msg: `Invalid transition: "${prevStatus}" → "${status}". Allowed: Pending → In Progress → Resolved.`
            });
        }

        // Apply status change
        issue.status = status;

        // Award coins on "In Progress" (accepted)
        if (status === 'In Progress' && !issue.coinsAwarded.accepted) {
            issue.acceptedAt = new Date();
            try {
                const User = require('../models/User');
                await User.findByIdAndUpdate(issue.createdBy, {
                    $inc: { coins: 100 },
                    $push: {
                        notifications: {
                            message: `Your report "${issue.title}" was accepted. You earned 100 Civic Points.`,
                            type: 'coins',
                            meta: { issueId: issue._id }
                        }
                    }
                });
                issue.coinsAwarded.accepted = true;
            } catch (coinErr) {
                console.error('Error awarding coins on accept:', coinErr);
            }
        }

        // Award coins on "Resolved"
        if (status === 'Resolved' && !issue.coinsAwarded.resolved) {
            issue.resolvedAt = new Date();
            try {
                const User = require('../models/User');
                await User.findByIdAndUpdate(issue.createdBy, {
                    $inc: { coins: 300 },
                    $push: {
                        notifications: {
                            message: `Your report "${issue.title}" was resolved. You earned 300 Civic Points.`,
                            type: 'coins',
                            meta: { issueId: issue._id }
                        }
                    }
                });
                issue.coinsAwarded.resolved = true;
            } catch (coinErr) {
                console.error('Error awarding coins on resolve:', coinErr);
            }
        }

        // Add comment if provided
        if (comment && comment.trim()) {
            if (!issue.comments) issue.comments = [];
            issue.comments.push({
                by: req.user.id,
                text: comment.trim(),
                at: new Date()
            });
        }

        await issue.save();

        // Return populated issue
        const updatedIssue = await Issue.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('assignedOfficer', 'name email department')
            .populate('comments.by', 'name email');

        res.json({
            msg: `Issue status updated to "${status}" successfully`,
            issue: updatedIssue
        });
    } catch (err) {
        console.error('Update Issue Status Error:', err);
        res.status(500).json({ msg: 'Server error while updating issue' });
    }
};


/**
 * Submit citizen feedback for a resolved issue
 * @route POST /api/issues/:id/feedback
 * @access Private (citizen – must be the creator)
 */
exports.submitFeedback = async (req, res) => {
    try {
        const { rating, comment } = req.body;

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ msg: 'Rating must be between 1 and 5' });
        }

        const issue = await Issue.findById(req.params.id);
        if (!issue) {
            return res.status(404).json({ msg: 'Issue not found' });
        }

        // Only the citizen who created the issue can submit feedback
        if (issue.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'You can only submit feedback for your own issues' });
        }

        // Issue must be Resolved
        if (issue.status !== 'Resolved') {
            return res.status(400).json({ msg: 'Feedback can only be submitted for resolved issues' });
        }

        // Prevent duplicate feedback
        if (issue.feedback && issue.feedback.submitted) {
            return res.status(400).json({ msg: 'Feedback already submitted for this issue' });
        }

        // Save feedback
        issue.feedback = {
            submitted: true,
            rating: Number(rating),
            comment: comment ? comment.trim() : '',
            submittedAt: new Date()
        };

        await issue.save();

        res.json({ msg: 'Feedback submitted successfully', feedback: issue.feedback });
    } catch (err) {
        console.error('Submit Feedback Error:', err);
        res.status(500).json({ msg: 'Server error while submitting feedback' });
    }
};

/**
 * Delete an issue (admin only)
 * @route DELETE /api/issues/:id
 * @access Private (admin)
 */
exports.deleteIssue = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);
        if (!issue) {
            return res.status(404).json({ msg: 'Issue not found' });
        }

        await Issue.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Issue deleted successfully' });
    } catch (err) {
        console.error('Delete Issue Error:', err);
        res.status(500).json({ msg: 'Server error while deleting issue' });
    }
};

/**
 * Get analytics data (admin only)
 * @route GET /api/issues/analytics
 * @access Private (admin)
 */
exports.getAnalytics = async (req, res) => {
    try {
        const totalIssues = await Issue.countDocuments();
        const resolvedIssues = await Issue.countDocuments({ status: 'Resolved' });
        const pendingIssues = await Issue.countDocuments({ status: 'Pending' });
        const inProgressIssues = await Issue.countDocuments({ status: 'In Progress' });

        // Issues by category
        const categoryStats = await Issue.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Issues by department
        const departmentStats = await Issue.aggregate([
            {
                $group: {
                    _id: '$department',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            total: totalIssues,
            resolved: resolvedIssues,
            pending: pendingIssues,
            inProgress: inProgressIssues,
            byCategory: categoryStats,
            byDepartment: departmentStats
        });
    } catch (err) {
        console.error('Get Analytics Error:', err);
        res.status(500).json({ msg: 'Server error while fetching analytics' });
    }
};
