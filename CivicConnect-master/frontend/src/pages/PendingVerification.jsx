import { useAuth } from "../context/AuthContext";

function DetailRow({ label, value }) {
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "rgba(148,163,184,.6)", textTransform: "uppercase", letterSpacing: ".4px", flexShrink: 0 }}>{label}</span>
            <span style={{ fontSize: "14px", fontWeight: "600", color: "rgba(203,213,225,.85)", textAlign: "right" }}>{value}</span>
        </div>
    );
}

function PendingVerification() {
    const { user, logout } = useAuth();

    return (
        <div style={{
            minHeight: "100vh", position: "relative",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "1.5rem", fontFamily: "'Inter',system-ui,sans-serif", overflow: "hidden",
            background: "var(--bg-base)",
        }}>
            {/* BG image */}
            <div style={{ position: "absolute", inset: 0, backgroundImage: "url(/login-bg.png)", backgroundSize: "cover", backgroundPosition: "center", zIndex: 0, opacity: 0.18 }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,rgba(10,5,30,.95) 0%,rgba(40,8,80,.9) 50%,rgba(10,5,30,.97) 100%)", zIndex: 1 }} />

            {/* Orbs */}
            <div className="anim-float" style={{ position: "absolute", width: "360px", height: "360px", borderRadius: "50%", background: "radial-gradient(circle,rgba(245,158,11,.12) 0%,transparent 70%)", top: "-60px", right: "-60px", zIndex: 1 }} />
            <div className="anim-float" style={{ position: "absolute", width: "280px", height: "280px", borderRadius: "50%", background: "radial-gradient(circle,rgba(139,92,246,.1) 0%,transparent 70%)", bottom: "-40px", left: "-40px", zIndex: 1, animationDelay: "4s" }} />

            {/* Card */}
            <div className="anim-fadeInUp" style={{
                position: "relative", zIndex: 10, width: "100%", maxWidth: "440px",
                background: "rgba(15,10,40,.6)", backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)", borderRadius: "28px",
                border: "1px solid rgba(255,255,255,.1)",
                boxShadow: "0 30px 80px rgba(0,0,0,.7),0 0 0 1px rgba(245,158,11,.06)",
                overflow: "hidden",
            }}>
                {/* Amber shimmer top */}
                <div style={{ height: "3px", background: "linear-gradient(90deg,#f97316,#f59e0b,#fbbf24,#f97316)", backgroundSize: "200% auto", animation: "shimmer 3s linear infinite" }} />

                {/* Icon section */}
                <div style={{ padding: "40px 40px 28px", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
                    <div style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: "80px", height: "80px", borderRadius: "22px",
                        background: "linear-gradient(135deg,rgba(245,158,11,.25),rgba(249,115,22,.2))",
                        border: "1px solid rgba(245,158,11,.35)",
                        boxShadow: "0 0 32px rgba(245,158,11,.25)",
                        marginBottom: "20px", fontSize: "40px", position: "relative",
                    }}>
                        ⏳
                        <div style={{ position: "absolute", inset: "-5px", borderRadius: "26px", border: "1px solid rgba(245,158,11,.25)", animation: "pulse-ring 3s ease-out infinite" }} />
                    </div>
                    <div style={{ fontSize: "12px", fontWeight: "600", letterSpacing: "2.5px", textTransform: "uppercase", color: "rgba(251,146,60,.75)", marginBottom: "8px" }}>Account Status</div>
                    <h1 style={{ fontSize: "26px", fontWeight: "800", background: "linear-gradient(135deg,#fff,#fde68a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: "10px" }}>Under Review</h1>
                    <p style={{ color: "rgba(203,213,225,.6)", fontSize: "14px", lineHeight: 1.6 }}>Your officer account has been created. An admin will verify your credentials shortly.</p>
                </div>

                {/* Details */}
                {user && (
                    <div style={{ padding: "22px 32px", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
                        <DetailRow label="Name"       value={user.name} />
                        <DetailRow label="Email"      value={user.email} />
                        <DetailRow label="Department" value={user.department || "—"} />
                        <DetailRow label="Status"     value={
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(245,158,11,.15)", border: "1px solid rgba(245,158,11,.3)", color: "#fbbf24", fontSize: "12px", fontWeight: "700", padding: "4px 10px", borderRadius: "20px" }}>
                                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#f59e0b", display: "inline-block" }}/>
                                Pending Verification
                            </span>
                        } />
                    </div>
                )}

                {/* What's next */}
                <div style={{ margin: "22px 32px", padding: "16px 18px", background: "rgba(139,92,246,.08)", border: "1px solid rgba(139,92,246,.2)", borderRadius: "14px" }}>
                    <p style={{ fontSize: "13px", fontWeight: "700", color: "rgba(196,181,253,.9)", marginBottom: "8px" }}>📬 What Happens Next?</p>
                    <p style={{ fontSize: "13px", color: "rgba(148,163,184,.7)", lineHeight: 1.6 }}>Our admin team will review your information. Once approved, sign in again to access the Officer Dashboard.</p>
                </div>

                {/* Sign out */}
                <div style={{ padding: "0 32px 32px" }}>
                    <button onClick={logout} className="btn-ghost" style={{ width: "100%", justifyContent: "center", padding: "13px" }}>
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PendingVerification;
