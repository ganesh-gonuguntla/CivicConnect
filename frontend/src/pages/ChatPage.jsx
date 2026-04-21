// src/pages/ChatPage.jsx
import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { getChatMessages, uploadChatMedia } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Derives backend URL from the API base (avoids hardcoding port)
const SOCKET_URL = 'http://localhost:3000';

/* ─── Tick indicator ────────────────────────────────────────── */
function Ticks({ deliveredAt, readAt }) {
    if (readAt) {
        return (
            <span className="inline-flex" title="Seen" style={{ color: '#60a5fa' }}>
                <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor">
                    <path d="M11.071.929a1 1 0 0 1 0 1.414L5.414 8 3 5.586A1 1 0 0 1 4.414 4.172L5.414 5.172 9.657.929a1 1 0 0 1 1.414 0z"/>
                    <path d="M15.071.929a1 1 0 0 1 0 1.414L9.414 8 8 6.586l5.657-5.657a1 1 0 0 1 1.414 0z"/>
                </svg>
            </span>
        );
    }
    if (deliveredAt) {
        return (
            <span className="inline-flex" title="Delivered" style={{ color: '#9ca3af' }}>
                <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor">
                    <path d="M11.071.929a1 1 0 0 1 0 1.414L5.414 8 3 5.586A1 1 0 0 1 4.414 4.172L5.414 5.172 9.657.929a1 1 0 0 1 1.414 0z"/>
                    <path d="M15.071.929a1 1 0 0 1 0 1.414L9.414 8 8 6.586l5.657-5.657a1 1 0 0 1 1.414 0z"/>
                </svg>
            </span>
        );
    }
    return (
        <span className="inline-flex" title="Sent" style={{ color: '#9ca3af' }}>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor">
                <path d="M9.071.929a1 1 0 0 1 0 1.414L4.414 7 2 4.586A1 1 0 0 1 3.414 3.172L4.414 4.172 7.657.929a1 1 0 0 1 1.414 0z"/>
            </svg>
        </span>
    );
}

/* ─── Single message bubble ─────────────────────────────────── */
function Bubble({ msg, isMine, onEditRequest }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const time = new Date(msg.createdAt).toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', hour12: true
    });

    return (
        <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} group mb-1`}>
            <div
                className={`relative max-w-[72%] md:max-w-[55%] rounded-2xl px-4 py-2.5 shadow-sm
                    ${isMine
                        ? 'bg-gradient-to-br from-violet-600 to-purple-700 text-white rounded-br-sm'
                        : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'
                    }`}
            >
                {/* Sender name (other side) */}
                {!isMine && (
                    <p className="text-xs font-bold text-violet-600 mb-0.5">{msg.sender?.name}</p>
                )}

                {/* Media */}
                {msg.type === 'image' && msg.mediaURL && (
                    <a href={msg.mediaURL} target="_blank" rel="noreferrer" className="block mb-1">
                        <img
                            src={msg.mediaURL}
                            alt="Shared"
                            className="rounded-xl max-h-56 w-full object-cover"
                        />
                    </a>
                )}
                {msg.type === 'video' && msg.mediaURL && (
                    <video src={msg.mediaURL} controls className="rounded-xl max-h-56 w-full mb-1" />
                )}

                {/* Text */}
                {msg.text && (
                    <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                        {msg.text}
                        {msg.editedAt && (
                            <span className={`ml-1 text-[10px] italic ${isMine ? 'text-purple-200' : 'text-gray-400'}`}>
                                (edited)
                            </span>
                        )}
                    </p>
                )}

                {/* Time + Ticks */}
                <div className="flex items-center gap-1 mt-0.5 justify-end">
                    <span className={`text-[10px] ${isMine ? 'text-purple-200' : 'text-gray-400'}`}>{time}</span>
                    {isMine && <Ticks deliveredAt={msg.deliveredAt} readAt={msg.readAt} />}
                </div>

                {/* Edit button (hover, my text messages only) */}
                {isMine && msg.type === 'text' && (
                    <div className="absolute -top-2 -left-8 hidden group-hover:flex">
                        <button
                            onClick={() => setMenuOpen(o => !o)}
                            className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 text-xs shadow"
                        >
                            ⋮
                        </button>
                        {menuOpen && (
                            <div className="absolute left-7 top-0 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10 min-w-[90px]">
                                <button
                                    onClick={() => { setMenuOpen(false); onEditRequest(msg); }}
                                    className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-1"
                                >
                                    ✏️ Edit
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─── Media preview before sending ──────────────────────────── */
function MediaPreview({ file, onClear }) {
    const isVideo = file.type.startsWith('video/');
    const url = URL.createObjectURL(file);
    return (
        <div className="relative inline-block mb-2 ml-4">
            {isVideo
                ? <video src={url} className="h-24 rounded-xl object-cover border border-gray-200" />
                : <img src={url} alt="preview" className="h-24 rounded-xl object-cover border border-gray-200" />
            }
            <button
                onClick={onClear}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center shadow"
            >
                ×
            </button>
        </div>
    );
}

/* ─── In-app notification toast ─────────────────────────────── */
function ChatNotification({ notification, onClose }) {
    useEffect(() => {
        const t = setTimeout(onClose, 4000);
        return () => clearTimeout(t);
    }, [onClose]);

    return (
        <div
            className="fixed top-4 right-4 z-50 bg-white rounded-2xl shadow-2xl border border-purple-100 p-4 flex items-start gap-3 max-w-xs"
            style={{ animation: 'slideInRight 0.3s ease' }}
        >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-white font-bold flex-shrink-0">
                {notification.from?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-800 truncate">{notification.from}</p>
                <p className="text-xs text-gray-500 truncate">{notification.preview}</p>
            </div>
            <button onClick={onClose} className="text-gray-300 hover:text-gray-500 text-sm flex-shrink-0">✕</button>
            <style>{`
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(60px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
            `}</style>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   CHAT PAGE
═══════════════════════════════════════════════════════════════ */
function ChatPage() {
    const { issueId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [text, setText] = useState('');
    const [mediaFile, setMediaFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [editingMsg, setEditingMsg] = useState(null);
    const [editText, setEditText] = useState('');
    const [issueInfo, setIssueInfo] = useState(null);
    const [notification, setNotification] = useState(null);

    const socketRef = useRef(null);
    const bottomRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToBottom = useCallback(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    // ── Connect socket + load history ─────────────────────────
    useEffect(() => {
        const token = localStorage.getItem('token');

        const socket = io(SOCKET_URL, { auth: { token } });
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('[Chat] Socket connected:', socket.id);
            socket.emit('joinRoom', issueId);
            socket.emit('markRead', { issueId });
        });

        socket.on('connect_error', (err) => {
            console.error('[Chat] Socket connection error:', err.message);
        });

        // New message received
        socket.on('newMessage', (msg) => {
            setMessages(prev => {
                // Avoid duplicate if echo
                if (prev.find(m => m._id === msg._id)) return prev;
                return [...prev, msg];
            });
            // Mark as read since chat is open
            socket.emit('markRead', { issueId });
        });

        // Other party read our messages → turn ticks blue
        socket.on('messagesRead', ({ readBy }) => {
            if (readBy !== user?.id) {
                setMessages(prev => prev.map(m => {
                    const sid = m.sender?._id || m.sender;
                    const isMyMsg = sid?.toString() === user?.id;
                    return isMyMsg && !m.readAt
                        ? { ...m, readAt: new Date().toISOString() }
                        : m;
                }));
            }
        });

        // Message edited
        socket.on('messageEdited', (updated) => {
            setMessages(prev => prev.map(m => m._id === updated._id ? updated : m));
        });

        // In-app notification from another chat room (server pushes this)
        socket.on('chatNotification', ({ from, preview }) => {
            setNotification({ from, preview });
        });

        // Load chat history
        getChatMessages(issueId)
            .then(res => setMessages(res.data.messages || []))
            .catch(err => console.error('[Chat] Load history error:', err))
            .finally(() => setLoading(false));

        return () => { socket.disconnect(); };
    }, [issueId, user?.id]);

    useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

    // ── Load issue info for header ────────────────────────────
    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch(`${SOCKET_URL}/api/issues/${issueId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(data => setIssueInfo(data))
            .catch(() => { });
    }, [issueId]);

    // ── Send ─────────────────────────────────────────────────
    const handleSend = async () => {
        if (!text.trim() && !mediaFile) return;
        const socket = socketRef.current;
        if (!socket?.connected) { console.warn('Socket not connected'); return; }

        if (mediaFile) {
            setUploading(true);
            try {
                const fd = new FormData();
                fd.append('media', mediaFile);
                const res = await uploadChatMedia(issueId, fd);
                const { url, type } = res.data;
                socket.emit('sendMessage', { issueId, type, text: text.trim(), mediaURL: url });
                setMediaFile(null);
            } catch (err) {
                console.error('Media upload error:', err);
            } finally {
                setUploading(false);
            }
        } else {
            socket.emit('sendMessage', { issueId, type: 'text', text: text.trim() });
        }
        setText('');
    };

    // ── Edit ─────────────────────────────────────────────────
    const handleEdit = () => {
        if (!editText.trim() || !editingMsg) return;
        socketRef.current?.emit('editMessage', { msgId: editingMsg._id, text: editText });
        setEditingMsg(null);
        setEditText('');
    };

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            editingMsg ? handleEdit() : handleSend();
        }
    };

    // ── Derive header info ────────────────────────────────────
    const isOfficer = user?.role === 'officer';
    const otherParty = issueInfo
        ? (isOfficer ? issueInfo.createdBy : issueInfo.assignedOfficer)
        : null;
    const otherName = otherParty?.name || (isOfficer ? 'Citizen' : 'Officer');
    const issueTitle = issueInfo?.title || 'Issue Chat';
    const department = issueInfo?.department || '';

    return (
        <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">

            {/* Notification toast */}
            {notification && (
                <ChatNotification notification={notification} onClose={() => setNotification(null)} />
            )}

            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-700 text-white px-4 py-4 flex items-center gap-3 shadow-lg flex-shrink-0">
                <button
                    onClick={() => navigate(-1)}
                    className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
                >
                    ← Back
                </button>
                <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center font-bold text-lg flex-shrink-0">
                    {otherName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-base leading-tight truncate">💬 {otherName}</p>
                    <p className="text-xs text-blue-100 truncate">
                        {issueTitle}{department ? ` · ${department} Dept` : ''}
                    </p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
                {loading && (
                    <div className="text-center py-12">
                        <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                        <p className="text-slate-400 text-sm mt-2">Loading messages…</p>
                    </div>
                )}

                {!loading && messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full gap-3 py-16">
                        <div className="text-5xl">💬</div>
                        <p className="text-slate-600 font-medium">No messages yet</p>
                        <p className="text-slate-400 text-sm">Start the conversation below</p>
                    </div>
                )}

                {messages.map(msg => {
                    const senderId = (msg.sender?._id || msg.sender)?.toString();
                    const isMine = senderId === user?.id?.toString();
                    return (
                        <Bubble
                            key={msg._id}
                            msg={msg}
                            isMine={isMine}
                            onEditRequest={(m) => { setEditingMsg(m); setEditText(m.text); }}
                        />
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {/* Edit banner */}
            {editingMsg && (
                <div className="bg-amber-50 border-t-2 border-amber-300 px-4 py-3 flex items-center gap-2 flex-shrink-0">
                    <span className="text-amber-700 text-sm font-semibold">✏️ Editing message</span>
                    <button
                        onClick={() => { setEditingMsg(null); setEditText(''); }}
                        className="ml-auto text-amber-600 hover:text-amber-700 text-sm font-medium transition"
                    >
                        ✕ Cancel
                    </button>
                </div>
            )}

            {/* Media preview */}
            {mediaFile && (
                <div className="bg-white border-t-2 border-slate-200 flex-shrink-0">
                    <MediaPreview file={mediaFile} onClear={() => setMediaFile(null)} />
                </div>
            )}

            {/* Input bar */}
            <div className="bg-white border-t-2 border-slate-200 px-3 py-3 flex items-end gap-2 flex-shrink-0 shadow-lg">
                {!editingMsg && (
                    <>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,video/*"
                            className="hidden"
                            onChange={e => { if (e.target.files[0]) setMediaFile(e.target.files[0]); }}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-blue-100 flex items-center justify-center text-slate-500 hover:text-blue-600 transition flex-shrink-0"
                            title="Attach image or video"
                        >
                            📎
                        </button>
                    </>
                )}

                <textarea
                    rows={1}
                    value={editingMsg ? editText : text}
                    onChange={e => editingMsg ? setEditText(e.target.value) : setText(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder={editingMsg ? 'Edit your message…' : 'Type a message…'}
                    className="flex-1 resize-none rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 max-h-32 overflow-y-auto transition"
                />

                <button
                    onClick={editingMsg ? handleEdit : handleSend}
                    disabled={uploading || (editingMsg ? !editText.trim() : (!text.trim() && !mediaFile))}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center flex-shrink-0 hover:from-blue-700 hover:to-blue-800 disabled:opacity-40 transition shadow-md"
                >
                    {uploading ? (
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                            <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                    ) : editingMsg ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
}

export default ChatPage;
