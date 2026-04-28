// routes/chat.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const chatController = require('../controllers/chatController');
const { auth } = require('../middleware/auth');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image and video files are allowed'), false);
        }
    }
});

// GET  /api/chat/:issueId          — fetch message history
router.get('/:issueId', auth, chatController.getMessages);

// POST /api/chat/:issueId/read     — mark messages as read
router.post('/:issueId/read', auth, chatController.markRead);

// POST /api/chat/:issueId/upload   — upload image/video, get URL back
router.post('/:issueId/upload', auth, upload.single('media'), chatController.uploadMedia);

// PUT  /api/chat/message/:msgId    — edit a text message
router.put('/message/:msgId', auth, chatController.editMessage);

module.exports = router;
