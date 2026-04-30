import { Link, useNavigate } from 'react-router-dom';
import HamburgerMenu from './HamburgerMenu';
import logo from '../assets/favicon.png';

function Navbar() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav className="bg-slate-950 border-b border-white/5 shadow-xl px-6 py-4 flex justify-between items-center">
            <div className="flex space-x-3 items-center">
                {user && user.role === 'citizen' && <HamburgerMenu />}
                <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-2 rounded-lg shadow-lg shadow-orange-500/20">
                        <img src={logo} alt="CivicConnect Logo" className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-300 bg-clip-text text-transparent">CivicConnect</h1>
                </div>
            </div>
            <div className="flex items-center space-x-6">
                {!user ? (
                    <>
                        <Link to="/login" className="text-slate-400 hover:text-white font-medium transition duration-200">Login</Link>
                        <Link to="/register" className="bg-gradient-to-r from-orange-500 to-amber-600 text-white px-5 py-2 rounded-lg hover:from-orange-600 hover:to-amber-700 transition duration-200 font-semibold shadow-lg shadow-orange-500/20">Register</Link>
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
