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
                className="p-2 rounded bg-white/10 hover:bg-white/20 text-white mr-3"
            >
                ☰
            </button>

            {open && (
                <div ref={menuRef} className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 shadow-lg bg-purple-900 ${isMobile ? 'w-3/4 max-w-xs' : 'w-64 lg:w-80'} `}>
                    <div className="p-4 border-b">
                        <div className="font-bold text-white text-[25px]">{profile ? profile.name : ''} - Menu </div>
                    </div>

                    <ul className="p-2 bg-purple-900 text-white space-y-4">
                        <li>
                            <button
                                onClick={() => { navigate('/my-issues'); setOpen(false); }}
                                className="w-full text-left px-3 py-2 hover:bg-purple-700 rounded transition-colors"
                            >
                                View All Reports
                            </button>
                        </li>
                        <hr className="border-white-500"></hr>
                        <li>
                            <button
                                onClick={() => { setShowReportModal(true); setOpen(false); }}
                                className="w-full text-left px-3 py-2 hover:bg-purple-700 rounded transition-colors"
                            >
                                New Report
                            </button>
                        </li>
                        <hr className="border-white-500"></hr>
                        <li>
                            <button
                                onClick={() => { setShowSettings(true); setOpen(false); }}
                                className="w-full text-left px-3 py-2 hover:bg-purple-700 rounded transition-colors"
                            >
                                Settings
                            </button>
                        </li>
                        <hr className="border-white-500"></hr>
                        <li>
                            <button
                                onClick={() => { setShowNotifications(true); setOpen(false); }}
                                className="relative w-full text-left px-3 py-2 hover:bg-purple-700 rounded transition-colors"
                            >
                                Notifications
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-3 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                        </li>
                        <hr className="border-white-500"></hr>
                        <li>
                            <button
                                onClick={() => { setShowLeaderboard(true); setOpen(false); }}
                                className="relative w-full text-left px-3 py-2 hover:bg-purple-700 rounded transition-colors flex justify-between items-center"
                            >
                                <span>Leaderboard</span>
                                🏆
                            </button>
                        </li>
                        <hr className="border-white-500"></hr>
                        <li>
                            <div className="px-3 py-2 text-sm">
                                <div className="font-semibold">Civic Points</div>
                                <div className="text-purple-700">{profile ? profile.coins : '0'}</div>
                            </div>
                        </li>
                    </ul>
                </div>
            )}

            {/* Report Modal */}
            {showReportModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
                    <div className="bg-white rounded-lg max-w-2xl w-full p-4">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-xl font-semibold text-purple-700">Report a Civic Issue</h3>
                            <button onClick={() => setShowReportModal(false)} className="text-xl">✕</button>
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
