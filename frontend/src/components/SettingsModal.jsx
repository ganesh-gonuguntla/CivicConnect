import { useState, useRef, useEffect } from 'react';
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
    const [showPassword, setShowPassword] = useState(false);
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
            setMsg('Profile updated successfully');
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

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
            <div ref={modalRef} className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
                <div className="flex justify-between items-center bg-slate-950 px-6 py-4 text-white">
                    <h3 className="text-lg font-bold text-white px-1 border-l-4 border-orange-500">Settings</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition">✕</button>
                </div>

                <div className="p-6">
                    {msg && <p className={`mb-3 ${msg.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{msg}</p>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Username</label>
                            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">New Password</label>
                            <div className="relative">
                                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Leave empty to keep current password" />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition"
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 font-semibold hover:bg-slate-200 transition">Cancel</button>
                            <button type="submit" disabled={loading} className="px-6 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold hover:from-orange-600 hover:to-amber-700 shadow-lg shadow-orange-500/20 transition disabled:opacity-50">{loading ? 'Saving...' : 'Save Changes'}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default SettingsModal;
