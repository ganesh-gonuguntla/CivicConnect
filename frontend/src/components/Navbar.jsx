import { Link, useNavigate } from 'react-router-dom';
import HamburgerMenu from './HamburgerMenu';

function Navbar() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 shadow-xl px-6 py-4 flex justify-between items-center">
            <div className="flex space-x-3 items-center">
                {user && user.role === 'citizen' && <HamburgerMenu />}
                <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-br from-blue-400 to-cyan-400 p-2 rounded-lg">
                        <img src="/src/assets/favicon.png" alt="CivicConnect Logo" className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">CivicConnect</h1>
                </div>
            </div>
            <div className="flex items-center space-x-6">
                {!user ? (
                    <>
                        <Link to="/login" className="text-slate-300 hover:text-white font-medium transition duration-200">Login</Link>
                        <Link to="/register" className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-2 rounded-lg hover:from-emerald-600 hover:to-teal-600 transition duration-200 font-medium">Register</Link>
                    </>
                ) : (
                    <>
                        <div className="text-right">
                            <span className="text-slate-300 text-sm">Welcome back</span>
                            <p className="text-white font-semibold">{user.name}</p>
                        </div>
                        <button 
                            onClick={handleLogout} 
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-200 font-medium"
                        >
                            Logout
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
