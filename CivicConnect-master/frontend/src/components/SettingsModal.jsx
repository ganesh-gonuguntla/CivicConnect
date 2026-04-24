import { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { updateProfile, getProfile } from '../services/api';

function SettingsModal({ onClose }) {
    const user = JSON.parse(localStorage.getItem('user')) || {};
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
    
    const [name, setName] = useState(user.name || '');
    const [password, setPassword] = useState('');
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg('');
        try {
            const data = {};
            if (name && name !== user.name) data.name = name;
            if (password) data.password = password;
            if (Object.keys(data).length === 0) {
                setMsg('No changes to save');
                setLoading(false);
                return;
            }

            await updateProfile(data);
            setMsg('✓ Profile updated successfully');
            // update local copy
            const r = await getProfile();
            localStorage.setItem('user', JSON.stringify(r.data));
            setPassword('');
        } catch (err) {
            console.error(err);
            setMsg(err.response?.data?.msg || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return ReactDOM.createPortal(
        <div className="fixed inset-0 flex items-center justify-center z-[10000] bg-black/60 backdrop-blur-sm p-4">
            <div ref={modalRef} className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col animate-slide-up">
                
                {/* Header */}
                <div className="bg-slate-50 border-b border-slate-100 px-6 py-5 flex justify-between items-center shrink-0">
                    <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-lg">
                            ⚙️
                        </div>
                        Account Settings
                    </h3>
                    <button 
                        onClick={onClose} 
                        className="text-slate-400 hover:text-red-500 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-sm"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 md:p-8 overflow-y-auto">
                    {msg && (
                        <div className={`mb-6 p-4 rounded-xl font-medium text-sm border flex items-center gap-3 animate-fade-in ${
                            msg.includes("successfully") || msg.includes("✓")
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-red-50 text-red-700 border-red-200"
                        }`}>
                            <span className="text-lg">{msg.includes("✓") ? "✅" : "⚠️"}</span>
                            {msg}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col" style={{ gap: '20px' }}>
                        
                        <div className="flex flex-col" style={{ gap: '8px' }}>
                            <label className="text-sm font-bold text-slate-700 ml-1">Username</label>
                            <input 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                className="w-full px-4 py-3 text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm" 
                            />
                        </div>

                        <div className="flex flex-col" style={{ gap: '8px' }}>
                            <label className="text-sm font-bold text-slate-700 ml-1">New Password</label>
                            <input 
                                type="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                className="w-full px-4 py-3 text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm" 
                                placeholder="Leave empty to keep current password" 
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-slate-100">
                            <button 
                                type="button" 
                                onClick={onClose} 
                                className="px-5 py-3 rounded-xl bg-white text-slate-700 font-bold hover:bg-slate-50 border border-slate-200 shadow-sm transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={loading} 
                                className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none disabled:hover:shadow-md flex items-center justify-center min-w-[140px]"
                            >
                                {loading ? (
                                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                    </svg>
                                ) : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
}

export default SettingsModal;
