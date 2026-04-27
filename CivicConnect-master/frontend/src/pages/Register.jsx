import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DEPARTMENTS = ["Roads", "Water", "Sanitation", "Electricity"];

function Register() {
    const { register, loading } = useAuth();
    const [form, setForm] = useState({ name: "", email: "", password: "", role: "citizen", department: "" });
    const [focused, setFocused] = useState(null);
    const [showPass, setShowPass] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
    const handleSubmit = (e) => { e.preventDefault(); register(form); };

    const labelStyle = (field) => ({
        display: "flex", alignItems: "center", gap: "6px",
        fontSize: "13px", fontWeight: "600", letterSpacing: "0.3px", marginBottom: "8px",
        color: focused === field ? "rgba(167,139,250,.9)" : "rgba(203,213,225,.75)",
        transition: "color .2s ease",
    });

    return (
        <div style={{
            minHeight: "100vh", position: "relative",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "1.5rem", fontFamily: "'Inter',system-ui,sans-serif", overflow: "hidden",
        }}>
            {/* BG */}
            <div style={{ position: "absolute", inset: 0, backgroundImage: "url(/login-bg.png)", backgroundSize: "cover", backgroundPosition: "center", zIndex: 0 }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,rgba(15,5,40,.88) 0%,rgba(60,10,100,.82) 50%,rgba(10,10,30,.92) 100%)", zIndex: 1 }} />
            <div className="anim-float" style={{ position: "absolute", width: "420px", height: "420px", borderRadius: "50%", background: "radial-gradient(circle,rgba(139,92,246,.14) 0%,transparent 70%)", top: "-80px", right: "-80px", zIndex: 1 }} />
            <div className="anim-float" style={{ position: "absolute", width: "320px", height: "320px", borderRadius: "50%", background: "radial-gradient(circle,rgba(236,72,153,.1) 0%,transparent 70%)", bottom: "-60px", left: "-60px", zIndex: 1, animationDelay: "3s", animationDirection: "reverse" }} />

            {/* Card */}
            <div className="anim-fadeInUp" style={{
                position: "relative", zIndex: 10, width: "100%", maxWidth: "480px",
                background: "rgba(15,10,40,.58)", backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)", borderRadius: "28px",
                border: "1px solid rgba(255,255,255,.11)",
                boxShadow: "0 30px 80px rgba(0,0,0,.65),0 0 0 1px rgba(139,92,246,.07),inset 0 1px 0 rgba(255,255,255,.07)",
                overflow: "hidden",
            }}>
                {/* shimmer top line */}
                <div style={{ height: "3px", background: "linear-gradient(90deg,#8b5cf6,#ec4899,#f97316,#8b5cf6)", backgroundSize: "200% auto", animation: "shimmer 4s linear infinite" }} />

                {/* Header */}
                <div style={{ padding: "32px 40px 24px", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
                    <div style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: "64px", height: "64px", borderRadius: "18px",
                        background: "linear-gradient(135deg,rgba(139,92,246,.3),rgba(236,72,153,.2))",
                        border: "1px solid rgba(139,92,246,.35)", boxShadow: "0 0 28px rgba(139,92,246,.28)",
                        marginBottom: "16px", position: "relative",
                    }}>
                        <img src="/src/assets/favicon.png" alt="CivicConnect" style={{ width: "36px", height: "36px", filter: "drop-shadow(0 0 8px rgba(139,92,246,.6))" }} />
                        <div style={{ position: "absolute", inset: "-4px", borderRadius: "22px", border: "1px solid rgba(139,92,246,.3)", animation: "pulse-ring 3s ease-out infinite" }} />
                    </div>
                    <div style={{ fontSize: "12px", fontWeight: "600", letterSpacing: "3px", textTransform: "uppercase", color: "rgba(167,139,250,.8)", marginBottom: "6px" }}>CivicConnect</div>
                    <h1 style={{ fontSize: "28px", fontWeight: "800", background: "linear-gradient(135deg,#fff,#c4b5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", margin: "0 0 8px" }}>Create Account</h1>
                    <p style={{ color: "rgba(203,213,225,.6)", fontSize: "14px" }}>Join the movement to make your city better</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ padding: "28px 40px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                        {/* Name */}
                        <div style={{ gridColumn: "1/-1" }}>
                            <label style={labelStyle("name")}>
                                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                                Full Name
                            </label>
                            <input name="name" placeholder="John Doe" value={form.name} onChange={handleChange}
                                onFocus={() => setFocused("name")} onBlur={() => setFocused(null)}
                                required className="cc-input" />
                        </div>

                        {/* Email */}
                        <div style={{ gridColumn: "1/-1" }}>
                            <label style={labelStyle("email")}>
                                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                                Email Address
                            </label>
                            <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange}
                                onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
                                required className="cc-input" />
                        </div>

                        {/* Password */}
                        <div style={{ gridColumn: "1/-1" }}>
                            <label style={labelStyle("password")}>
                                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                                Password
                            </label>
                            <div style={{ position: "relative" }}>
                                <input name="password" type={showPass ? "text" : "password"} placeholder="Create a strong password"
                                    value={form.password} onChange={handleChange}
                                    onFocus={() => setFocused("password")} onBlur={() => setFocused(null)}
                                    required className="cc-input" style={{ paddingRight: "48px" }} />
                                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                                    position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)",
                                    background: "none", border: "none", cursor: "pointer",
                                    color: "rgba(148,163,184,.65)", transition: "color .2s ease",
                                }} onMouseEnter={e => e.currentTarget.style.color = "rgba(167,139,250,1)"}
                                   onMouseLeave={e => e.currentTarget.style.color = "rgba(148,163,184,.65)"}>
                                    {showPass
                                        ? <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                                        : <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                                    }
                                </button>
                            </div>
                        </div>

                        {/* Role */}
                        <div>
                            <label style={labelStyle("role")}>
                                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                                I am a
                            </label>
                            <div style={{ position: "relative" }}>
                                <select name="role" value={form.role} onChange={handleChange}
                                    onFocus={() => setFocused("role")} onBlur={() => setFocused(null)}
                                    className="cc-select">
                                    <option value="citizen">Citizen</option>
                                    <option value="officer">City Officer</option>
                                    <option value="admin">Administrator</option>
                                </select>
                                <svg style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "rgba(148,163,184,.6)" }} width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                            </div>
                        </div>

                        {/* Department (officer only) */}
                        {form.role === "officer" && (
                            <div>
                                <label style={labelStyle("dept")}>
                                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                                    Department
                                </label>
                                <div style={{ position: "relative" }}>
                                    <select name="department" value={form.department} onChange={handleChange}
                                        onFocus={() => setFocused("dept")} onBlur={() => setFocused(null)}
                                        required className="cc-select">
                                        <option value="">Select department</option>
                                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                    <svg style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "rgba(148,163,184,.6)" }} width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                                </div>
                            </div>
                        )}
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", padding: "14px", fontSize: "16px", marginTop: "4px" }}>
                        {loading ? (
                            <><svg className="anim-spin" width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg>Creating account...</>
                        ) : (
                            <>Create Account <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg></>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div style={{ padding: "16px 40px 28px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,.06)" }}>
                    <p style={{ color: "rgba(148,163,184,.65)", fontSize: "14px" }}>
                        Already have an account?{" "}
                        <Link to="/login" style={{ color: "#fb923c", fontWeight: "700" }}
                            onMouseEnter={e => e.currentTarget.style.textShadow = "0 0 10px rgba(251,146,60,.5)"}
                            onMouseLeave={e => e.currentTarget.style.textShadow = "none"}>
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;
