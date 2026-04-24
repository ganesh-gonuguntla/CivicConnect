import { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { getNotifications, markNotificationsRead } from '../services/api';

function NotificationsModal({ onClose, onRefresh }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const modalRef = useRef(null);

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [onClose]);

    const handleClickOutside = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            onClose();
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await getNotifications();
            setNotifications(res.data);
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        } finally {
            setLoading(false);
        }
    };

    const markSingleRead = async (id) => {
        try {
            await markNotificationsRead([id]);
            setNotifications((prev) => prev.map(n => n._id === id ? { ...n, read: true } : n));
            if (onRefresh) onRefresh();
        } catch (err) {
            console.warn('Failed to mark notification read', err);
        }
    };

    const markAllRead = async () => {
        try {
            await markNotificationsRead();
            setNotifications((prev) => prev.map(n => ({ ...n, read: true })));
            if (onRefresh) onRefresh();
        } catch (err) {
            console.warn('Failed to mark all notifications read', err);
        }
    };

    return ReactDOM.createPortal(
        <div className="fixed inset-0 flex items-center justify-center z-[10000] bg-black/75 backdrop-blur-md p-4">
            <div ref={modalRef} className="bg-[#0f0a23] border border-white/10 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-slide-up">
                <div className="flex justify-between items-center bg-white/5 border-b border-white/10 px-6 py-5 text-white">
                    <h3 className="text-xl font-extrabold flex items-center gap-3">
                        <span className="text-2xl">🔔</span> Notifications
                    </h3>
                    <button onClick={onClose} className="text-white/50 hover:text-white transition text-2xl leading-none">&times;</button>
                </div>

                {loading ? (
                    <div className="py-12 text-center text-white/50 font-medium flex flex-col items-center gap-3">
                        <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                        Loading...
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="py-12 text-center text-white/50 font-medium">No recent notifications</div>
                ) : (
                    <>
                        <div className="flex justify-end p-4 pb-0 bg-white/5">
                            <button
                                onClick={markAllRead}
                                className="text-xs font-bold text-orange-400 hover:text-orange-300 transition uppercase tracking-wider bg-orange-500/10 px-3 py-1.5 rounded-lg border border-orange-500/20 hover:bg-orange-500/20"
                            >
                                Mark all as read
                            </button>
                        </div>
                        <div className="space-y-3 overflow-y-auto p-4 pt-4 bg-white/5 flex-1">
                            {notifications.map((n) => (
                                <div
                                    key={n._id}
                                    onClick={() => !n.read && markSingleRead(n._id)}
                                    className={`p-4 border rounded-2xl transition cursor-pointer ${
                                        n.read 
                                            ? 'bg-white/5 border-white/5 opacity-70' 
                                            : 'bg-gradient-to-r from-orange-500/10 to-transparent border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.1)]'
                                    } hover:border-orange-500/50`}
                                >
                                    <div className={`text-sm leading-relaxed ${n.read ? 'text-white/70' : 'text-white font-semibold'}`}>{n.message}</div>
                                    <div className="text-[10px] text-white/40 mt-2 font-medium uppercase tracking-tight">{new Date(n.createdAt).toLocaleString()}</div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>,
        document.body
    );
}

export default NotificationsModal;
