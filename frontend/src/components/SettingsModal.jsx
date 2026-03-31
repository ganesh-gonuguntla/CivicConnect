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
            <div ref={modalRef} className="bg-purple-50 rounded-lg max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-purple-700">Settings</h3>
                    <button onClick={onClose}>✕</button>
                </div>

                {msg && <p className={`mb-3 ${msg.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{msg}</p>}

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Username</label>
                        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border p-2 rounded" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">New Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border p-2 rounded" placeholder="Leave empty to keep current password" />
                    </div>

                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200">Cancel</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-purple-700 text-white">{loading ? 'Saving...' : 'Save'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SettingsModal;
