import { useEffect, useState, useRef } from 'react';
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

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
            <div ref={modalRef} className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-slide-up">
                <div className="flex justify-between items-center bg-slate-950 px-6 py-4 text-white">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <span className="text-orange-500">🔔</span> Notifications
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition text-2xl leading-none">✕</button>
                </div>

                {loading ? (
                    <div className="py-8 text-center text-gray-600">Loading...</div>
                ) : notifications.length === 0 ? (
                    <div className="py-8 text-center text-gray-600">No recent notifications</div>
                ) : (
                    <>
                        <div className="flex justify-end p-4 pb-0">
                            <button
                                onClick={markAllRead}
                                className="text-xs font-bold text-orange-600 hover:text-orange-700 transition uppercase tracking-wider"
                            >
                                Mark all as read
                            </button>
                        </div>
                        <div className="space-y-3 max-h-80 overflow-y-auto p-4 pt-4">
                            {notifications.map((n) => (
                                <div
                                    key={n._id}
                                    onClick={() => !n.read && markSingleRead(n._id)}
                                    className={`p-4 border rounded-xl cursor-pointer transition ${n.read ? 'bg-slate-50 border-slate-100' : 'bg-orange-50/30 border-orange-100'} hover:border-orange-300 hover:shadow-sm`}
                                >
                                    <div className={`text-sm ${n.read ? 'text-slate-600' : 'text-slate-900 font-medium'}`}>{n.message}</div>
                                    <div className="text-[10px] text-slate-400 mt-2 font-medium uppercase tracking-tight">{new Date(n.createdAt).toLocaleString()}</div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default NotificationsModal;
