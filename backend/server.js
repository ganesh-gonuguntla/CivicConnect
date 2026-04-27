require('dotenv').config({ override: true });
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const Message = require('./models/Message');

const app = express();
const server = http.createServer(app); // wrap express in http server

// ── CORS ──────────────────────────────────────────────────────
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────
const authRoutes = require('./routes/auth');
const issueRoutes = require('./routes/issues');
const deptRoutes = require('./routes/departments');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chat');

app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/departments', deptRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);

app.get('/', (req, res) => res.send('CivicConnect API running'));

// ── Socket.io ─────────────────────────────────────────────────
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Authenticate socket connections via JWT
io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication error'));
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        socket.userRole = decoded.role;
        next();
    } catch {
        next(new Error('Invalid token'));
    }
});

// Track userId → socketId for targeted notifications
const connectedUsers = {};

io.on('connection', (socket) => {
    console.log(`[Socket] Connected: ${socket.userId} (${socket.userRole})`);

    // Register this socket for the user
    connectedUsers[socket.userId] = socket.id;

    // Join a specific issue's chat room
    socket.on('joinRoom', (issueId) => {
        socket.join(issueId);
        console.log(`[Socket] ${socket.userId} joined room: ${issueId}`);
    });

    // Send a message
    socket.on('sendMessage', async (payload, callback) => {
        try {
            const { issueId, type = 'text', text = '', mediaURL = '' } = payload;

            const msg = await Message.create({
                issueId,
                sender: socket.userId,
                type,
                text,
                mediaURL,
                deliveredAt: new Date(),
            });

            const populated = await Message.findById(msg._id).populate('sender', 'name role');

            // Broadcast to room (sender + receiver both see message)
            io.to(issueId).emit('newMessage', populated);

            // Push notification to the OTHER party if they are online
            // Find the issue to know who the other party is
            const Issue = require('./models/Issue');
            const issue = await Issue.findById(issueId).select('createdBy assignedOfficer');
            if (issue) {
                const myId = socket.userId.toString();
                const creatorId = issue.createdBy?.toString();
                const officerId = issue.assignedOfficer?.toString();

                // Determine receiver
                const receiverId = myId === creatorId ? officerId : creatorId;

                if (receiverId && connectedUsers[receiverId]) {
                    const receiverSocketId = connectedUsers[receiverId];
                    const preview = type === 'text'
                        ? (text.length > 40 ? text.slice(0, 40) + '…' : text)
                        : type === 'image' ? '📷 Image' : '🎥 Video';

                    // Only send notification if receiver is NOT already in this room
                    const receiverSocket = io.sockets.sockets.get(receiverSocketId);
                    const isInRoom = receiverSocket?.rooms?.has(issueId);
                    if (!isInRoom) {
                        io.to(receiverSocketId).emit('chatNotification', {
                            from: populated.sender?.name || 'Someone',
                            preview,
                            issueId,
                        });
                    }
                }

                // Also persist notification in DB for offline users
                try {
                    const User = require('./models/User');
                    if (receiverId) {
                        const previewText = type === 'text'
                            ? (text.length > 60 ? text.slice(0, 60) + '…' : text)
                            : type === 'image' ? '📷 Sent you an image' : '🎥 Sent you a video';
                        await User.findByIdAndUpdate(receiverId, {
                            $push: {
                                notifications: {
                                    message: `💬 ${populated.sender?.name}: ${previewText}`,
                                    type: 'chat',
                                    meta: { issueId }
                                }
                            }
                        });
                    }
                } catch (notifErr) {
                    console.error('[Socket] Notification persist error:', notifErr);
                }
            }

            if (callback) callback({ success: true, message: populated });
        } catch (err) {
            console.error('[Socket] sendMessage error:', err);
            if (callback) callback({ success: false, error: err.message });
        }
    });

    // Mark all messages in a room as read
    socket.on('markRead', async ({ issueId }) => {
        try {
            const updated = await Message.updateMany(
                { issueId, sender: { $ne: socket.userId }, readAt: null },
                { $set: { readAt: new Date() } }
            );
            if (updated.modifiedCount > 0) {
                io.to(issueId).emit('messagesRead', { issueId, readBy: socket.userId });
            }
        } catch (err) {
            console.error('[Socket] markRead error:', err);
        }
    });

    // Edit a text message
    socket.on('editMessage', async ({ msgId, text }, callback) => {
        try {
            const message = await Message.findById(msgId);
            if (!message) throw new Error('Message not found');
            if (message.sender.toString() !== socket.userId) throw new Error('Not your message');
            if (message.type !== 'text') throw new Error('Only text can be edited');

            message.text = text.trim();
            message.editedAt = new Date();
            await message.save();

            const updated = await Message.findById(msgId).populate('sender', 'name role');
            io.to(message.issueId.toString()).emit('messageEdited', updated);
            if (callback) callback({ success: true, message: updated });
        } catch (err) {
            console.error('[Socket] editMessage error:', err);
            if (callback) callback({ success: false, error: err.message });
        }
    });

    socket.on('disconnect', () => {
        // Clean up user tracking
        if (connectedUsers[socket.userId] === socket.id) {
            delete connectedUsers[socket.userId];
        }
        console.log(`[Socket] Disconnected: ${socket.userId}`);
    });
});

// ── Start ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        server.listen(PORT, () => console.log(`Server running on port ${PORT} with Socket.io`));
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });
