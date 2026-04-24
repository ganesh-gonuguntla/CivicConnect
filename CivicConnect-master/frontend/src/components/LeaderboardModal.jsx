import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { getLeaderboard } from '../services/api';

function LeaderboardModal({ onClose }) {
    const [top10, setTop10] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await getLeaderboard();
            setTop10(res.data.top10);
            setCurrentUser(res.data.currentUser);
        } catch (err) {
            console.error('Failed to fetch leaderboard:', err);
        } finally {
            setLoading(false);
        }
    };

    const isCurrentUserInTop10 = top10.some(u => u._id === currentUser?.id);

    return ReactDOM.createPortal(
        <div className="fixed inset-0 flex items-center justify-center z-[10000] bg-black/75 backdrop-blur-md p-4">
            <div className="bg-[#0f0a23] border border-white/10 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="bg-white/5 border-b border-white/10 p-6 flex justify-between items-center text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="relative z-10">
                        <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-3">
                            <span className="text-3xl">🏆</span> Global Leaderboard
                        </h2>
                        <p className="text-white/50 text-sm mt-1">Top 10 Civic Pointers Worldwide</p>
                    </div>
                    <button onClick={onClose} className="text-white/50 hover:text-white transition text-3xl leading-none relative z-10">&times;</button>
                </div>

                {/* Content */}
                <div className="p-0 overflow-y-auto flex-1 bg-white/5">
                    {loading ? (
                        <div className="py-12 text-center text-white/50 font-medium flex flex-col items-center gap-3">
                            <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                            Loading rankings...
                        </div>
                    ) : (
                        <div className="flex flex-col pb-4">
                            {/* Table Header */}
                            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-white/5 border-b border-white/10 text-xs font-bold text-white/40 uppercase tracking-wider sticky top-0 z-10 backdrop-blur-md">
                                <div className="col-span-2 text-center">Rank</div>
                                <div className="col-span-7">Citizen Name</div>
                                <div className="col-span-3 text-right">Points</div>
                            </div>
                            
                            {/* Top 10 List */}
                            <div className="divide-y divide-white/5">
                                {top10.map((user, index) => {
                                    const rank = index + 1;
                                    const isMe = user._id === currentUser?.id;
                                    
                                    // Medals for top 3
                                    let rankDisplay = <span className="text-white/50 font-bold text-lg">#{rank}</span>;
                                    if (rank === 1) rankDisplay = <span className="text-3xl" title="1st Place">🥇</span>;
                                    if (rank === 2) rankDisplay = <span className="text-3xl" title="2nd Place">🥈</span>;
                                    if (rank === 3) rankDisplay = <span className="text-3xl" title="3rd Place">🥉</span>;

                                    return (
                                        <div key={user._id} className={`grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors ${
                                            isMe 
                                            ? 'bg-orange-500/10 border-l-4 border-orange-500' 
                                            : 'hover:bg-white/5 border-l-4 border-transparent'
                                        }`}>
                                            <div className="col-span-2 text-center flex justify-center items-center h-8">
                                                {rankDisplay}
                                            </div>
                                            <div className="col-span-7 font-bold text-white/90 flex items-center gap-2 text-base">
                                                {user.name} 
                                                {isMe && <span className="text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wide">You</span>}
                                            </div>
                                            <div className="col-span-3 text-right font-extrabold text-orange-400 text-lg">
                                                {(user.coins || 0).toLocaleString()}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Current User Row if NOT in top 10 */}
                            {!isCurrentUserInTop10 && currentUser && (
                                <div className="mt-6 px-6">
                                    <div className="relative mb-4">
                                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                            <div className="w-full border-t border-white/10 border-dashed"></div>
                                        </div>
                                        <div className="relative flex justify-center">
                                            <span className="px-3 bg-[#0f0a23] text-xs font-bold uppercase tracking-wider text-white/40">Your Standing</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-12 gap-4 px-4 py-4 items-center bg-orange-500/10 shadow-lg rounded-2xl border border-orange-500/30 transform hover:scale-[1.02] transition-transform duration-200">
                                        <div className="col-span-2 text-center flex justify-center items-center h-8">
                                            <span className="text-orange-400 font-bold text-lg">#{currentUser.rank}</span>
                                        </div>
                                        <div className="col-span-7 font-bold text-white flex items-center gap-2 text-base">
                                            {currentUser.name}
                                            <span className="text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wide shadow-sm">You</span>
                                        </div>
                                        <div className="col-span-3 text-right font-extrabold text-orange-400 text-lg">
                                            {(currentUser.coins || 0).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}

export default LeaderboardModal;
