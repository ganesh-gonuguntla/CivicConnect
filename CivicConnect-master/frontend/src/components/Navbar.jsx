import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import HamburgerMenu from './HamburgerMenu';

const navStyles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-12px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
.navbar-root {
  animation: slideDown 0.4s ease forwards;
  font-family: 'Inter', system-ui, sans-serif;
}
.logout-btn {
  transition: all 0.25s ease !important;
}
.logout-btn:hover {
  background: rgba(239,68,68,0.2) !important;
  border-color: rgba(239,68,68,0.5) !important;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(239,68,68,0.25) !important;
}
.nav-logo-wrap { transition: transform 0.3s ease; }
.nav-logo-wrap:hover { transform: scale(1.05) rotate(-3deg); }
`;

function Navbar() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <>
            <style>{navStyles}</style>
            <nav className="navbar-root" style={{
                position: 'sticky', top: 0, zIndex: 100,
                background: scrolled
                    ? 'rgba(9,9,15,0.92)'
                    : 'rgba(9,9,15,0.75)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderBottom: scrolled
                    ? '1px solid rgba(139,92,246,0.2)'
                    : '1px solid rgba(255,255,255,0.06)',
                boxShadow: scrolled ? '0 8px 30px rgba(0,0,0,0.5)' : 'none',
                padding: '0 24px',
                height: '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.3s ease',
            }}>
                {/* Left */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {user && user.role === 'citizen' && <HamburgerMenu />}
                    <Link to={user ? `/${user.role}` : '/login'} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="nav-logo-wrap" style={{
                            width: '36px', height: '36px', borderRadius: '10px',
                            background: 'linear-gradient(135deg,#f97316,#f59e0b)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 14px rgba(249,115,22,0.4)',
                        }}>
                            <img src="/src/assets/favicon.png" alt="CivicConnect" style={{ width: '20px', height: '20px' }} />
                        </div>
                        <span style={{
                            fontSize: '20px', fontWeight: '800', letterSpacing: '-0.3px',
                            background: 'linear-gradient(135deg,#a78bfa,#f9a8d4)',
                            backgroundSize: '200% auto',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                            animation: 'shimmer 4s linear infinite',
                        }}>CivicConnect</span>
                    </Link>
                </div>

                {/* Right */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {!user ? (
                        <>
                            <Link to="/login" style={{
                                color: 'rgba(203,213,225,0.8)', fontWeight: '500', fontSize: '14px',
                                textDecoration: 'none', padding: '8px 16px', borderRadius: '10px',
                                transition: 'all 0.2s ease',
                            }}
                                onMouseEnter={e => e.currentTarget.style.color = 'white'}
                                onMouseLeave={e => e.currentTarget.style.color = 'rgba(203,213,225,0.8)'}
                            >Login</Link>
                            <Link to="/register" style={{
                                background: 'linear-gradient(135deg,#f97316,#f59e0b)',
                                color: 'white', fontWeight: '700', fontSize: '14px',
                                textDecoration: 'none', padding: '8px 18px', borderRadius: '10px',
                                boxShadow: '0 4px 14px rgba(249,115,22,0.35)',
                                transition: 'all 0.2s ease',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 22px rgba(249,115,22,0.5)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(249,115,22,0.35)'; }}
                            >Register</Link>
                        </>
                    ) : (
                        <>
                            {/* User chip */}
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '12px', padding: '7px 14px',
                            }}>
                                <div style={{
                                    width: '30px', height: '30px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg,#8b5cf6,#ec4899)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '13px', fontWeight: '700', color: 'white', flexShrink: 0,
                                }}>{user.name?.[0]?.toUpperCase() || '?'}</div>
                                <div>
                                    <p style={{ margin: 0, fontSize: '11px', color: 'rgba(148,163,184,0.7)', fontWeight: '500' }}>Welcome back</p>
                                    <p style={{ margin: 0, fontSize: '14px', color: 'white', fontWeight: '700', lineHeight: 1.2 }}>{user.name}</p>
                                </div>
                            </div>

                            <button
                                className="logout-btn"
                                onClick={handleLogout}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                                    color: '#f87171', padding: '8px 16px', borderRadius: '10px',
                                    fontWeight: '600', fontSize: '14px', cursor: 'pointer',
                                    fontFamily: 'inherit',
                                }}
                            >
                                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Logout
                            </button>
                        </>
                    )}
                </div>
            </nav>
        </>
    );
}

export default Navbar;
