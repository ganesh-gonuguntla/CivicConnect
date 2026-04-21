import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReportIssueForm from './ReportIssueForm';
import SettingsModal from './SettingsModal';
import NotificationsModal from './NotificationsModal';
import LeaderboardModal from './LeaderboardModal';
import { getProfile } from '../services/api';

function HamburgerMenu() {
    const [open, setOpen] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [profile, setProfile] = useState(null);
    const navigate = useNavigate();

    const [isMobile, setIsMobile] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // close when clicking outside menu
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (open && menuRef.current && !menuRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);


    useEffect(() => {
        if (open) fetchProfile();
    }, [open]);

    // compute unread count whenever profile updates
    useEffect(() => {
        if (profile) {
            if (typeof profile.unreadNotifications === 'number') {
                setUnreadCount(profile.unreadNotifications);
            } else if (profile.notifications) {
                const count = profile.notifications.filter(n => !n.read).length;
                setUnreadCount(count);
            }
        } else {
            setUnreadCount(0);
        }
    }, [profile]);

    const fetchProfile = async () => {
        try {
            const res = await getProfile();
            setProfile(res.data);
            // update localStorage user so rest of app sees updated coins/name
            localStorage.setItem('user', JSON.stringify(res.data));
        } catch (err) {
            console.error('Failed to fetch profile:', err);
        }
    };

    const closeAll = () => {
        setShowReportModal(false);
        setShowSettings(false);
        setShowNotifications(false);
        setShowLeaderboard(false);
    };

    return (
        <div className="relative">
            <button
                aria-label="Open menu"
                onClick={() => setOpen(!open)}
                className="p-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 mr-3 transition-colors"
            >
                ☰
            </button>

            {open && (
                <div ref={menuRef} className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 shadow-2xl bg-slate-950 ${isMobile ? 'w-3/4 max-w-xs' : 'w-64 lg:w-80'}`}>
                    {/* Header */}
                    <div className="p-6 bg-slate-950 border-b border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl -mr-12 -mt-12"></div>
                        <div className="font-bold text-white text-lg">
                            👋 {profile?.name || 'Menu'}
                        </div>
                    </div>

                    {/* Menu Items */}
                    <ul className="p-4 text-white space-y-2">
                        <li>
                            <button
                                onClick={() => { navigate('/my-issues'); setOpen(false); }}
                                className="w-full text-left px-4 py-3 hover:bg-violet-600 rounded-lg transition-colors border-l-4 border-transparent hover:border-violet-400"
                            >
                                📋 View All Reports
                            </button>
                        </li>

                        <li>
                            <button
                                onClick={() => { setShowReportModal(true); setOpen(false); }}
                                className="w-full text-left px-4 py-3 hover:bg-emerald-600 rounded-lg transition-colors border-l-4 border-transparent hover:border-emerald-400"
                            >
                                📝 New Report
                            </button>
                        </li>

                        <li>
                            <button
                                onClick={() => { setShowSettings(true); setOpen(false); }}
                                className="w-full text-left px-4 py-3 hover:bg-slate-700 rounded-lg transition-colors border-l-4 border-transparent hover:border-slate-400"
                            >
                                ⚙️ Settings
                            </button>
                        </li>

                        <li>
                            <button
                                onClick={() => { setShowNotifications(true); setOpen(false); }}
                                className="relative w-full text-left px-4 py-3 hover:bg-amber-600 rounded-lg transition-colors border-l-4 border-transparent hover:border-amber-400"
                            >
                                🔔 Notifications
                                {unreadCount > 0 && (
                                    <span className="absolute top-2 right-3 inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                        </li>

                        <li>
                            <button
                                onClick={() => { setShowLeaderboard(true); setOpen(false); }}
                                className="w-full text-left px-4 py-3 hover:bg-white/5 rounded-lg transition-colors border-l-4 border-transparent hover:border-orange-500 flex justify-between items-center"
                            >
                                <span>🏆 Leaderboard</span>
                            </button>
                        </li>

                        <li className="pt-4 px-2">
                            <div className="px-4 py-4 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg shadow-orange-500/20">
                                <div className="font-bold text-white/80 text-xs uppercase tracking-widest mb-1">🎯 Civic Points</div>
                                <div className="text-3xl font-black text-white">{profile?.coins || '0'}</div>
                            </div>
                        </li>
                    </ul>
                </div>
            )}

            {/* Report Modal */}
            {showReportModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-slate-200">
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">📝 Report a Civic Issue</h3>
                            <button onClick={() => setShowReportModal(false)} className="text-2xl text-slate-500 hover:text-slate-700 transition">✕</button>
                        </div>
                        <ReportIssueForm
                            embedded
                            onSuccess={() => {
                                setShowReportModal(false);
                                fetchProfile();
                                window.dispatchEvent(new Event("issueReported"));
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Settings Modal */}
            {showSettings && (
                <SettingsModal onClose={() => { setShowSettings(false); fetchProfile(); }} />
            )}

            {/* Notifications Modal */}
            {showNotifications && (
                <NotificationsModal
                    onClose={() => { setShowNotifications(false); fetchProfile(); }}
                    onRefresh={fetchProfile}
                />
            )}

            {/* Leaderboard Modal */}
            {showLeaderboard && (
                <LeaderboardModal onClose={() => setShowLeaderboard(false)} />
            )}
        </div>
    );
}

export default HamburgerMenu;
