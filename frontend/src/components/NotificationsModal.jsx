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
            <div ref={modalRef} className="bg-purple-50 rounded-lg max-w-lg w-full p-4">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-purple-700">Notifications</h3>
                    <button onClick={onClose}>✕</button>
                </div>

                {loading ? (
                    <div className="py-8 text-center text-gray-600">Loading...</div>
                ) : notifications.length === 0 ? (
                    <div className="py-8 text-center text-gray-600">No recent notifications</div>
                ) : (
                    <>
                        <div className="flex justify-end mb-2">
                            <button
                                onClick={markAllRead}
                                className="text-xs text-purple-700 hover:underline"
                            >
                                Mark all read
                            </button>
                        </div>
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                            {notifications.map((n) => (
                                <div
                                    key={n._id}
                                    onClick={() => !n.read && markSingleRead(n._id)}
                                    className={`p-3 border rounded cursor-pointer ${n.read ? 'bg-gray-100' : 'bg-purple-50'} hover:bg-gray-50`}
                                >
                                    <div className="text-sm text-gray-700">{n.message}</div>
                                    <div className="text-xs text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
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
