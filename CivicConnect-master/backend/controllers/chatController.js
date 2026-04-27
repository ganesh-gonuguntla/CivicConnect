// controllers/chatController.js
const Message = require('../models/Message');
const Issue = require('../models/Issue');
const cloudinary = require('../config/cloudinary');

/**
 * Upload media buffer to Cloudinary under civicconnect/chat/
 */
const uploadChatMedia = (fileBuffer, resourceType = 'image') => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'civicconnect/chat', resource_type: resourceType },
            (err, result) => (err ? reject(err) : resolve(result.secure_url))
        );
        stream.end(fileBuffer);
    });
};

/**
 * GET /api/chat/:issueId
 * Fetch message history for an issue room (paginated, newest last)
 */
exports.getMessages = async (req, res) => {
    try {
        const { issueId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        // Verify user is allowed to access this issue's chat
        const issue = await Issue.findById(issueId);
        if (!issue) return res.status(404).json({ msg: 'Issue not found' });

        const userId = req.user.id;
        const role = req.user.role;
        const isCreator = issue.createdBy.toString() === userId;
        const isAssigned = issue.assignedOfficer?.toString() === userId;
        const isAdmin = role === 'admin';

        if (!isCreator && !isAssigned && !isAdmin) {
            return res.status(403).json({ msg: 'Not authorized to view this chat' });
        }

        const messages = await Message.find({ issueId })
            .populate('sender', 'name role')
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(limit);

        res.json({ messages, page });
    } catch (err) {
        console.error('getMessages Error:', err);
        res.status(500).json({ msg: 'Server error fetching messages' });
    }
};

/**
 * POST /api/chat/:issueId/read
 * Mark all messages in the room as read by the current user (excluding their own)
 */
exports.markRead = async (req, res) => {
    try {
        const { issueId } = req.params;
        const userId = req.user.id;

        await Message.updateMany(
            { issueId, sender: { $ne: userId }, readAt: null },
            { $set: { readAt: new Date() } }
        );

        res.json({ msg: 'Marked as read' });
    } catch (err) {
        console.error('markRead Error:', err);
        res.status(500).json({ msg: 'Server error marking messages read' });
    }
};

/**
 * PUT /api/chat/message/:msgId
 * Edit a previously sent message (sender only, text messages only)
 */
exports.editMessage = async (req, res) => {
    try {
        const { msgId } = req.params;
        const { text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ msg: 'Message text cannot be empty' });
        }

        const message = await Message.findById(msgId);
        if (!message) return res.status(404).json({ msg: 'Message not found' });

        if (message.sender.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'You can only edit your own messages' });
        }

        if (message.type !== 'text') {
            return res.status(400).json({ msg: 'Only text messages can be edited' });
        }

        message.text = text.trim();
        message.editedAt = new Date();
        await message.save();

        const updated = await Message.findById(msgId).populate('sender', 'name role');
        res.json({ message: updated });
    } catch (err) {
        console.error('editMessage Error:', err);
        res.status(500).json({ msg: 'Server error editing message' });
    }
};

/**
 * POST /api/chat/:issueId/upload
 * Upload image/video and return Cloudinary URL (used before sending via socket)
 */
exports.uploadMedia = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ msg: 'No file provided' });

        const isVideo = req.file.mimetype.startsWith('video/');
        const resourceType = isVideo ? 'video' : 'image';

        const url = await uploadChatMedia(req.file.buffer, resourceType);
        const type = isVideo ? 'video' : 'image';

        res.json({ url, type });
    } catch (err) {
        console.error('uploadMedia Error:', err);
        res.status(500).json({ msg: 'Failed to upload media' });
    }
};
