// routes/issues.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const issueController = require('../controllers/issueController');
const { auth, permit } = require('../middleware/auth');

// Multer setup for memory storage (Cloudinary upload)
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept only images
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// @route   POST /api/issues
// @desc    Create a new issue
// @access  Private (citizen, admin)
router.post(
    '/',
    auth,
    permit('citizen', 'admin'),
    upload.single('image'),
    issueController.createIssue
);

// @route   GET /api/issues/my
// @desc    Get issues created by current user
// @access  Private (citizen)
router.get('/my', auth, issueController.getMyIssues);

// @route   GET /api/issues/assigned
// @desc    Get issues assigned to officer's department
// @access  Private (officer)
router.get('/assigned', auth, permit('officer'), issueController.getAssignedIssues);

// @route   GET /api/issues/all
// @desc    Get all issues (admin only)
// @access  Private (admin)
router.get('/all', auth, permit('admin'), issueController.getAllIssues);

// @route   GET /api/issues/analytics
// @desc    Get analytics data
// @access  Private (admin)
router.get('/analytics', auth, permit('admin'), issueController.getAnalytics);

// @route   GET /api/issues/:id
// @desc    Get single issue by ID
// @access  Private
router.get('/:id', auth, issueController.getIssueById);

// @route   GET /api/issues
// @desc    Get all issues (role-based filtering)
// @access  Private
router.get('/', auth, issueController.getIssues);

// @route   PUT /api/issues/:id/status
// @desc    Update issue status and add comments
// @access  Private (officer, admin)
router.put('/:id/status', auth, permit('officer', 'admin'), issueController.updateIssueStatus);

module.exports = router;
