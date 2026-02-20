import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow p-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">CivicConnect</h1>

            <div className="space-x-4">
                {!user ? (
                    <>
                        <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
                        <Link to="/register" className="text-green-600 hover:underline">Register</Link>
                    </>
                ) : (
                    <>
                        <span className="text-gray-700">Hi, {user.name}</span>
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
