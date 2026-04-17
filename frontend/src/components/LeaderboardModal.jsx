import { useState, useEffect } from 'react';
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

    return (
        <div className="fixed inset-0 flex items-center justify-center z-[60] bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-purple-50 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-700 to-indigo-600 p-6 flex justify-between items-center text-white">
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight">Global Leaderboard</h2>
                        <p className="text-purple-100 text-sm mt-1">Top 10 Civic Pointers Worldwide</p>
                    </div>
                    <button onClick={onClose} className="text-white hover:bg-purple-50/20 p-2 rounded-full transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-0 overflow-y-auto flex-1 bg-gray-50">
                    {loading ? (
                        <div className="p-8 text-center text-purple-600 font-medium animate-pulse flex flex-col items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-purple-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Loading rankings...
                        </div>
                    ) : (
                        <div className="flex flex-col pb-4">
                            {/* Table Header */}
                            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-100 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider sticky top-0 z-10">
                                <div className="col-span-2 text-center">Rank</div>
                                <div className="col-span-7">Citizen Name</div>
                                <div className="col-span-3 text-right">Points</div>
                            </div>
                            
                            {/* Top 10 List */}
                            <div className="divide-y divide-gray-100">
                                {top10.map((user, index) => {
                                    const rank = index + 1;
                                    const isMe = user._id === currentUser?.id;
                                    
                                    // Medals for top 3
                                    let rankDisplay = <span className="text-gray-500 font-bold text-lg">#{rank}</span>;
                                    if (rank === 1) rankDisplay = <span className="text-3xl" title="1st Place">🥇</span>;
                                    if (rank === 2) rankDisplay = <span className="text-3xl" title="2nd Place">🥈</span>;
                                    if (rank === 3) rankDisplay = <span className="text-3xl" title="3rd Place">🥉</span>;

                                    return (
                                        <div key={user._id} className={`grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors ${
                                            isMe 
                                            ? 'bg-purple-100 bg-opacity-80 border-l-4 border-purple-600 hover:bg-purple-200' 
                                            : 'bg-purple-50 hover:bg-gray-50 border-l-4 border-transparent'
                                        }`}>
                                            <div className="col-span-2 text-center flex justify-center items-center h-8">
                                                {rankDisplay}
                                            </div>
                                            <div className="col-span-7 font-bold text-gray-800 flex items-center gap-2 text-lg">
                                                {user.name} 
                                                {isMe && <span className="text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wide">You</span>}
                                            </div>
                                            <div className="col-span-3 text-right font-extrabold text-indigo-600 text-lg">
                                                {(user.coins || 0).toLocaleString()}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Current User Row if NOT in top 10 */}
                            {!isCurrentUserInTop10 && currentUser && (
                                <div className="mt-4 px-4">
                                    <div className="relative mb-4">
                                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                            <div className="w-full border-t border-gray-300 border-dashed"></div>
                                        </div>
                                        <div className="relative flex justify-center">
                                            <span className="px-3 bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-400">Your Standing</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-12 gap-4 px-4 py-4 items-center bg-purple-100 shadow-md rounded-xl border-l-4 border-purple-600 transform hover:scale-[1.02] transition-transform duration-200">
                                        <div className="col-span-2 text-center flex justify-center items-center h-8">
                                            <span className="text-purple-800 font-bold text-lg">#{currentUser.rank}</span>
                                        </div>
                                        <div className="col-span-7 font-bold text-gray-800 flex items-center gap-2 text-lg">
                                            {currentUser.name}
                                            <span className="text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wide shadow-sm">You</span>
                                        </div>
                                        <div className="col-span-3 text-right font-extrabold text-indigo-600 text-lg">
                                            {(currentUser.coins || 0).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default LeaderboardModal;
