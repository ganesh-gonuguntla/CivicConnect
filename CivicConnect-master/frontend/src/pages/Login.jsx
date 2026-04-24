import { useState } from "react";
import { Link } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";

function Login() {
    const { login, loginWithGoogle, loading } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState(null);

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: (tokenResponse) => {
            if (tokenResponse?.access_token) {
                loginWithGoogle(tokenResponse.access_token);
            } else {
                alert("Google login did not return a valid token");
            }
        },
        onError: () => {
            alert("Google login was cancelled or failed");
        },
        scope: "openid profile email",
        flow: "implicit",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        login(email, password);
    };

    return (
        <div style={{
            minHeight: '100vh',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
            overflow: 'hidden',
        }}>
            {/* Background Image */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'url(/login-bg.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                zIndex: 0,
            }} />

            {/* Dark overlay with gradient */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, rgba(15,5,40,0.85) 0%, rgba(60,10,100,0.80) 50%, rgba(10,10,30,0.90) 100%)',
                zIndex: 1,
            }} />

            {/* Animated floating orbs */}
            <div style={{
                position: 'absolute',
                width: '500px',
                height: '500px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
                top: '-100px',
                right: '-100px',
                animation: 'float 8s ease-in-out infinite',
                zIndex: 1,
            }} />
            <div style={{
                position: 'absolute',
                width: '400px',
                height: '400px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(236,72,153,0.10) 0%, transparent 70%)',
                bottom: '-80px',
                left: '-80px',
                animation: 'float 10s ease-in-out infinite reverse',
                zIndex: 1,
            }} />
            <div style={{
                position: 'absolute',
                width: '300px',
                height: '300px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
                top: '40%',
                left: '10%',
                animation: 'float 12s ease-in-out infinite',
                zIndex: 1,
            }} />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
                
                @keyframes float {
                    0%, 100% { transform: translateY(0px) scale(1); }
                    50% { transform: translateY(-20px) scale(1.05); }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes shimmer {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                @keyframes pulse-ring {
                    0% { transform: scale(1); opacity: 0.8; }
                    100% { transform: scale(1.4); opacity: 0; }
                }
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes twinkle {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.5); }
                }
                .login-card {
                    animation: slideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .input-field {
                    transition: all 0.3s ease;
                    background: rgba(255,255,255,0.07) !important;
                    border: 1.5px solid rgba(255,255,255,0.15) !important;
                    color: white !important;
                    backdrop-filter: blur(8px);
                }
                .input-field:focus {
                    outline: none !important;
                    border-color: rgba(167,139,250,0.7) !important;
                    background: rgba(255,255,255,0.12) !important;
                    box-shadow: 0 0 0 3px rgba(139,92,246,0.20), 0 0 20px rgba(139,92,246,0.15) !important;
                }
                .input-field::placeholder {
                    color: rgba(255,255,255,0.35) !important;
                }
                .btn-signin {
                    background: linear-gradient(135deg, #f97316, #f59e0b, #ef4444);
                    background-size: 200% auto;
                    transition: all 0.4s ease;
                    border: none;
                    cursor: pointer;
                    position: relative;
                    overflow: hidden;
                }
                .btn-signin::before {
                    content: '';
                    position: absolute;
                    top: 0; left: -100%;
                    width: 100%; height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
                    transition: left 0.5s ease;
                }
                .btn-signin:hover::before { left: 100%; }
                .btn-signin:hover {
                    background-position: right center;
                    transform: translateY(-2px);
                    box-shadow: 0 15px 35px rgba(249,115,22,0.4) !important;
                }
                .btn-signin:active { transform: translateY(0); }
                .btn-google {
                    background: rgba(255,255,255,0.08);
                    border: 1.5px solid rgba(255,255,255,0.18);
                    backdrop-filter: blur(8px);
                    transition: all 0.3s ease;
                    cursor: pointer;
                    color: white;
                }
                .btn-google:hover {
                    background: rgba(255,255,255,0.14);
                    border-color: rgba(255,255,255,0.3);
                    transform: translateY(-2px);
                    box-shadow: 0 10px 25px rgba(0,0,0,0.3);
                }
                .show-pass-btn:hover { color: rgba(167,139,250,1) !important; }
                .register-link { transition: all 0.2s ease; }
                .register-link:hover { color: #fb923c !important; text-shadow: 0 0 10px rgba(251,146,60,0.5); }
                .label-animate {
                    transition: all 0.2s ease;
                }
                .feature-tag {
                    transition: all 0.3s ease;
                }
                .feature-tag:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                }
            `}</style>

            {/* Main card */}
            <div className="login-card" style={{
                position: 'relative',
                zIndex: 10,
                width: '100%',
                maxWidth: '460px',
                background: 'rgba(15, 10, 40, 0.55)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderRadius: '28px',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 25px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,246,0.08), inset 0 1px 0 rgba(255,255,255,0.08)',
                overflow: 'hidden',
            }}>
                {/* Top gradient border line */}
                <div style={{
                    height: '3px',
                    background: 'linear-gradient(90deg, #8b5cf6, #ec4899, #f97316, #8b5cf6)',
                    backgroundSize: '200% auto',
                    animation: 'shimmer 4s linear infinite',
                }} />

                {/* Header */}
                <div style={{
                    padding: '40px 44px 28px',
                    textAlign: 'center',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}>
                    {/* Logo */}
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '72px',
                        height: '72px',
                        borderRadius: '20px',
                        background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(236,72,153,0.2))',
                        border: '1px solid rgba(139,92,246,0.4)',
                        boxShadow: '0 0 30px rgba(139,92,246,0.3)',
                        marginBottom: '20px',
                        position: 'relative',
                    }}>
                        <img src="/src/assets/favicon.png" alt="CivicConnect Logo" style={{
                            width: '40px',
                            height: '40px',
                            filter: 'drop-shadow(0 0 8px rgba(139,92,246,0.6))',
                        }} />
                        {/* Animated ring */}
                        <div style={{
                            position: 'absolute',
                            inset: '-4px',
                            borderRadius: '24px',
                            border: '1px solid rgba(139,92,246,0.3)',
                            animation: 'pulse-ring 3s ease-out infinite',
                        }} />
                    </div>

                    <div style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        letterSpacing: '3px',
                        textTransform: 'uppercase',
                        color: 'rgba(167,139,250,0.8)',
                        marginBottom: '8px',
                    }}>CivicConnect</div>

                    <h1 style={{
                        fontSize: '32px',
                        fontWeight: '800',
                        color: 'white',
                        margin: '0 0 10px',
                        background: 'linear-gradient(135deg, #ffffff, #c4b5fd)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}>Welcome Back</h1>

                    <p style={{
                        color: 'rgba(203,213,225,0.65)',
                        fontSize: '15px',
                        margin: 0,
                        lineHeight: '1.5',
                    }}>Sign in to your account to continue making your city better</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ padding: '32px 44px' }}>
                    {/* Email Field */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: focusedField === 'email' ? 'rgba(167,139,250,0.9)' : 'rgba(203,213,225,0.8)',
                            marginBottom: '8px',
                            transition: 'color 0.2s ease',
                            letterSpacing: '0.3px',
                        }}>
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Email Address
                        </label>
                        <input
                            type="email"
                            className="input-field"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => setFocusedField(null)}
                            required
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                borderRadius: '12px',
                                fontSize: '15px',
                                boxSizing: 'border-box',
                                fontFamily: 'inherit',
                            }}
                        />
                    </div>

                    {/* Password Field */}
                    <div style={{ marginBottom: '28px' }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: focusedField === 'password' ? 'rgba(167,139,250,0.9)' : 'rgba(203,213,225,0.8)',
                            marginBottom: '8px',
                            transition: 'color 0.2s ease',
                            letterSpacing: '0.3px',
                        }}>
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                className="input-field"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => setFocusedField('password')}
                                onBlur={() => setFocusedField(null)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '14px 48px 14px 16px',
                                    borderRadius: '12px',
                                    fontSize: '15px',
                                    boxSizing: 'border-box',
                                    fontFamily: 'inherit',
                                }}
                            />
                            <button
                                type="button"
                                className="show-pass-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '14px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'rgba(148,163,184,0.7)',
                                    padding: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    transition: 'color 0.2s ease',
                                }}
                            >
                                {showPassword ? (
                                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                ) : (
                                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Sign In Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-signin"
                        style={{
                            width: '100%',
                            padding: '15px',
                            borderRadius: '14px',
                            fontSize: '16px',
                            fontWeight: '700',
                            color: 'white',
                            letterSpacing: '0.3px',
                            boxShadow: '0 8px 25px rgba(249,115,22,0.3)',
                            opacity: loading ? 0.7 : 1,
                            fontFamily: 'inherit',
                        }}
                    >
                        {loading ? (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                <svg style={{ animation: 'spin-slow 1s linear infinite' }} width="18" height="18" fill="none" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                                    <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                                </svg>
                                Signing in...
                            </span>
                        ) : (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                Sign In
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </span>
                        )}
                    </button>

                    {/* Divider */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        margin: '24px 0',
                    }}>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                        <span style={{ fontSize: '13px', color: 'rgba(148,163,184,0.6)', fontWeight: '500', letterSpacing: '0.5px' }}>OR</span>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                    </div>

                    {/* Google Button */}
                    <button
                        type="button"
                        disabled={loading}
                        onClick={() => handleGoogleLogin()}
                        className="btn-google"
                        style={{
                            width: '100%',
                            padding: '14px',
                            borderRadius: '14px',
                            fontSize: '15px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            opacity: loading ? 0.7 : 1,
                            fontFamily: 'inherit',
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Continue with Google
                    </button>
                </form>

                {/* Footer */}
                <div style={{
                    padding: '20px 44px 32px',
                    textAlign: 'center',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                }}>
                    <p style={{ color: 'rgba(148,163,184,0.65)', fontSize: '14px', margin: '0 0 16px' }}>
                        Don't have an account?{' '}
                        <Link
                            to="/register"
                            className="register-link"
                            style={{
                                color: '#fb923c',
                                fontWeight: '700',
                                textDecoration: 'none',
                            }}
                        >
                            Create one here
                        </Link>
                    </p>

                    {/* Feature tags */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {['🏙️ Report Issues', '📊 Track Progress', '🤝 Community'].map((tag) => (
                            <span key={tag} className="feature-tag" style={{
                                background: 'rgba(139,92,246,0.12)',
                                border: '1px solid rgba(139,92,246,0.2)',
                                color: 'rgba(196,181,253,0.8)',
                                fontSize: '11px',
                                fontWeight: '500',
                                padding: '4px 10px',
                                borderRadius: '20px',
                                cursor: 'default',
                            }}>{tag}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
