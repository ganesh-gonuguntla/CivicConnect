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
        <nav className="bg-[#62109F] shadow p-4 flex justify-between items-center">
            <div className="flex space-x-2 items-center">
                {user && user.role === 'citizen' && <HamburgerMenu />}
                <h1 className="text-2xl font-bold text-white">CivicConnect </h1>
                <img src="/src/assets/favicon.png"  alt="CivicConnect Logo" className="w-8 h-8 ml-2 inline-block" />
            </div>
            <div className="space-x-4">
                {!user ? (
                    <>
                        <Link to="/login" className="text-purple-700 hover:underline">Login</Link>
                        <Link to="/register" className="text-green-600 hover:underline">Register</Link>
                    </>
                ) : (
                    <>
                        <b><span className="text-white">Hi, {user.name}</span></b>
                        <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                            Logout
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
