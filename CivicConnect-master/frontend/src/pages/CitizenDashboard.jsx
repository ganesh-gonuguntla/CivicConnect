import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyIssues } from "../services/api";
import ReportIssueForm from "../components/ReportIssueForm";

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
}
@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes countUp {
  from { opacity: 0; transform: scale(0.5); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(139,92,246,0.3); }
  50% { box-shadow: 0 0 40px rgba(139,92,246,0.6); }
}

.dash-hero { animation: fadeInUp 0.6s ease forwards; }
.stat-card { animation: fadeInUp 0.6s ease forwards; transition: all 0.3s ease; }
.stat-card:hover { transform: translateY(-6px) scale(1.02); }
.issue-card { animation: fadeInUp 0.5s ease forwards; transition: all 0.35s cubic-bezier(0.34,1.56,0.64,1); }
.issue-card:hover { transform: translateY(-8px); }
.stat-number { animation: countUp 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards; }
.report-btn {
  background: linear-gradient(135deg, #f97316, #f59e0b);
  background-size: 200% auto;
  transition: all 0.3s ease;
  position: relative; overflow: hidden;
}
.report-btn::before {
  content: ''; position: absolute; top: 0; left: -100%;
  width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
  transition: left 0.5s ease;
}
.report-btn:hover::before { left: 100%; }
.report-btn:hover { transform: translateY(-3px); box-shadow: 0 20px 40px rgba(249,115,22,0.45) !important; }
.view-all-btn { transition: all 0.2s ease; }
.view-all-btn:hover { transform: translateX(4px); }
.modal-overlay { animation: fadeInUp 0.2s ease forwards; }
`;

function CitizenDashboard() {
    const navigate = useNavigate();
    const [issues, setIssues] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const user = JSON.parse(localStorage.getItem("user"));

    const fetchIssues = async () => {
        try {
            const res = await getMyIssues();
            setIssues(res.data);
        } catch (err) {
            console.error("Error fetching issues:", err);
        }
    };

    useEffect(() => {
        fetchIssues();
        const handler = () => fetchIssues();
        window.addEventListener("issueReported", handler);
        return () => window.removeEventListener("issueReported", handler);
    }, []);

    const recentIssues = issues.slice(0, 3);
    const resolved = issues.filter(i => i.status === "Resolved").length;
    const inProgress = issues.filter(i => i.status === "In Progress").length;

    const statusConfig = {
        "Resolved":    { bg: "rgba(16,185,129,0.15)", color: "#34d399", border: "rgba(16,185,129,0.3)", dot: "#10b981" },
        "In Progress": { bg: "rgba(245,158,11,0.15)", color: "#fbbf24", border: "rgba(245,158,11,0.3)", dot: "#f59e0b" },
        "Pending":     { bg: "rgba(239,68,68,0.15)",  color: "#f87171", border: "rgba(239,68,68,0.3)",  dot: "#ef4444" },
    };

    const stats = [
        { label: "Total Reported", value: issues.length, icon: "📋", gradient: "linear-gradient(135deg,#8b5cf6,#6d28d9)", glow: "rgba(139,92,246,0.35)", delay: "0s" },
        { label: "Resolved",       value: resolved,       icon: "✅", gradient: "linear-gradient(135deg,#10b981,#059669)", glow: "rgba(16,185,129,0.35)", delay: "0.1s" },
        { label: "In Progress",    value: inProgress,     icon: "⏳", gradient: "linear-gradient(135deg,#f59e0b,#d97706)", glow: "rgba(245,158,11,0.35)", delay: "0.2s" },
    ];

    return (
        <div style={{ minHeight: "100vh", background: "#09090f", fontFamily: "'Inter',system-ui,sans-serif" }}>
            <style>{styles}</style>

            {/* ── HERO SECTION ── */}
            <div className="dash-hero" style={{
                position: "relative", overflow: "hidden", minHeight: "340px",
                display: "flex", alignItems: "center",
            }}>
                {/* Background image */}
                <div style={{
                    position: "absolute", inset: 0,
                    backgroundImage: "url(/dashboard-bg.png)",
                    backgroundSize: "cover", backgroundPosition: "center top",
                    zIndex: 0,
                }} />
                {/* Overlays */}
                <div style={{
                    position: "absolute", inset: 0, zIndex: 1,
                    background: "linear-gradient(135deg,rgba(10,5,30,0.88) 0%,rgba(60,10,100,0.75) 60%,rgba(10,5,30,0.82) 100%)",
                }} />
                <div style={{
                    position: "absolute", inset: 0, zIndex: 1,
                    background: "linear-gradient(to bottom, transparent 60%, #09090f 100%)",
                }} />

                {/* Floating orb */}
                <div style={{
                    position: "absolute", right: "-60px", top: "-60px",
                    width: "380px", height: "380px", borderRadius: "50%",
                    background: "radial-gradient(circle,rgba(139,92,246,0.2) 0%,transparent 70%)",
                    animation: "float 8s ease-in-out infinite", zIndex: 1,
                }} />

                {/* Content */}
                <div style={{ position: "relative", zIndex: 2, maxWidth: "1100px", margin: "0 auto", padding: "60px 32px 80px" }}>
                    <div style={{
                        display: "inline-flex", alignItems: "center", gap: "8px",
                        background: "rgba(139,92,246,0.18)", border: "1px solid rgba(139,92,246,0.3)",
                        borderRadius: "100px", padding: "6px 14px", marginBottom: "20px",
                        fontSize: "13px", color: "rgba(196,181,253,0.9)", fontWeight: "600",
                    }}>
                        <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#a78bfa", display: "inline-block", animation: "pulse-glow 2s infinite" }} />
                        {user?.name ? `Welcome back, ${user.name.split(" ")[0]}` : "Citizen Dashboard"}
                    </div>

                    <h1 style={{
                        fontSize: "clamp(36px,5vw,58px)", fontWeight: "900", margin: "0 0 14px",
                        background: "linear-gradient(135deg,#ffffff 0%,#c4b5fd 60%,#f9a8d4 100%)",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                        lineHeight: 1.1,
                    }}>Make Your City Better</h1>

                    <p style={{ color: "rgba(203,213,225,0.7)", fontSize: "17px", maxWidth: "520px", marginBottom: "32px", lineHeight: 1.6 }}>
                        Report civic issues in your community. Every issue you report helps improve our city.
                    </p>

                    <button
                        className="report-btn"
                        onClick={() => setShowModal(true)}
                        style={{
                            display: "inline-flex", alignItems: "center", gap: "10px",
                            padding: "15px 32px", borderRadius: "14px", border: "none", cursor: "pointer",
                            fontSize: "16px", fontWeight: "700", color: "white",
                            boxShadow: "0 10px 30px rgba(249,115,22,0.35)",
                            fontFamily: "inherit",
                        }}
                    >
                        <span style={{ fontSize: "20px" }}>+</span>
                        Report a New Issue
                    </button>
                </div>
            </div>

            {/* ── MAIN CONTENT ── */}
            <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 32px 60px" }}>

                {/* Stats Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "20px", marginTop: "-40px", marginBottom: "48px", position: "relative", zIndex: 5 }}>
                    {stats.map((s, i) => (
                        <div key={s.label} className="stat-card" style={{ animationDelay: s.delay }}>
                            <div style={{
                                background: "rgba(255,255,255,0.04)",
                                backdropFilter: "blur(20px)",
                                border: "1px solid rgba(255,255,255,0.08)",
                                borderRadius: "20px",
                                padding: "24px 26px",
                                boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)`,
                                display: "flex", alignItems: "center", gap: "18px",
                            }}>
                                <div style={{
                                    width: "52px", height: "52px", borderRadius: "14px",
                                    background: s.gradient,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "22px", flexShrink: 0,
                                    boxShadow: `0 8px 20px ${s.glow}`,
                                }}>{s.icon}</div>
                                <div>
                                    <p style={{ color: "rgba(148,163,184,0.8)", fontSize: "12px", fontWeight: "600", letterSpacing: "0.5px", textTransform: "uppercase", margin: "0 0 4px" }}>{s.label}</p>
                                    <p className="stat-number" style={{ fontSize: "36px", fontWeight: "800", margin: 0, background: s.gradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{s.value}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Issues Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                    <div>
                        <h2 style={{ fontSize: "26px", fontWeight: "800", color: "white", margin: "0 0 4px" }}>Your Recent Issues</h2>
                        <p style={{ color: "rgba(148,163,184,0.6)", fontSize: "14px", margin: 0 }}>Track the status of your reported civic issues</p>
                    </div>
                    {issues.length > 3 && (
                        <button
                            className="view-all-btn"
                            onClick={() => navigate("/my-issues")}
                            style={{
                                display: "flex", alignItems: "center", gap: "6px",
                                background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.25)",
                                color: "#fb923c", borderRadius: "10px", padding: "8px 16px",
                                fontWeight: "700", fontSize: "14px", cursor: "pointer",
                                fontFamily: "inherit",
                            }}
                        >
                            View All ({issues.length}) →
                        </button>
                    )}
                </div>

                {/* Issue Cards */}
                {recentIssues.length === 0 ? (
                    <div style={{
                        background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.1)",
                        borderRadius: "20px", padding: "64px 32px", textAlign: "center",
                    }}>
                        <div style={{ fontSize: "56px", marginBottom: "16px" }}>📝</div>
                        <p style={{ color: "rgba(203,213,225,0.7)", fontSize: "18px", fontWeight: "600", margin: "0 0 8px" }}>No issues reported yet</p>
                        <p style={{ color: "rgba(148,163,184,0.5)", fontSize: "14px", margin: 0 }}>Start by reporting an issue to help improve your community</p>
                    </div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "22px" }}>
                        {recentIssues.map((issue, idx) => {
                            const sc = statusConfig[issue.status] || statusConfig["Pending"];
                            return (
                                <div
                                    key={issue._id}
                                    className="issue-card"
                                    onClick={() => navigate("/my-issues")}
                                    style={{
                                        background: "rgba(255,255,255,0.04)",
                                        backdropFilter: "blur(16px)",
                                        border: "1px solid rgba(255,255,255,0.08)",
                                        borderRadius: "20px", overflow: "hidden", cursor: "pointer",
                                        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                                        animationDelay: `${idx * 0.08}s`,
                                    }}
                                >
                                    {issue.imageURL && (
                                        <div style={{ width: "100%", height: "180px", overflow: "hidden", position: "relative" }}>
                                            <img src={issue.imageURL} alt={issue.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
                                                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"}
                                                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                                            />
                                            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,0.5) 0%,transparent 60%)" }} />
                                        </div>
                                    )}
                                    <div style={{ padding: "20px 22px 22px" }}>
                                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px", marginBottom: "10px" }}>
                                            <h4 style={{ fontSize: "16px", fontWeight: "700", color: "white", margin: 0, lineHeight: 1.3, flex: 1 }}
                                                style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                                {issue.title}
                                            </h4>
                                            <span style={{
                                                display: "inline-flex", alignItems: "center", gap: "5px",
                                                background: sc.bg, border: `1px solid ${sc.border}`,
                                                color: sc.color, fontSize: "11px", fontWeight: "700",
                                                padding: "4px 10px", borderRadius: "20px", whiteSpace: "nowrap", flexShrink: 0,
                                            }}>
                                                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: sc.dot, display: "inline-block" }} />
                                                {issue.status}
                                            </span>
                                        </div>

                                        <p style={{ color: "rgba(148,163,184,0.7)", fontSize: "13px", lineHeight: 1.5, margin: "0 0 16px",
                                            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                            {issue.description}
                                        </p>

                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                            <span style={{
                                                background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.25)",
                                                color: "rgba(196,181,253,0.9)", fontSize: "11px", fontWeight: "600",
                                                padding: "3px 10px", borderRadius: "20px",
                                            }}>{issue.category}</span>
                                            {issue.location?.address && (
                                                <span style={{ color: "rgba(148,163,184,0.6)", fontSize: "12px", display: "flex", alignItems: "center", gap: "3px" }}>
                                                    📍 <span style={{ maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{issue.location.address}</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── MODAL ── */}
            {showModal && (
                <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }} style={{
                    position: "fixed", inset: 0, zIndex: 50,
                    background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)",
                    display: "flex", alignItems: "center", justifyContent: "center", padding: "16px",
                }}>
                    <div style={{
                        background: "rgba(15,10,35,0.95)", backdropFilter: "blur(24px)",
                        border: "1px solid rgba(255,255,255,0.1)", borderRadius: "24px",
                        width: "100%", maxWidth: "680px", maxHeight: "90vh", overflow: "hidden",
                        boxShadow: "0 30px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(139,92,246,0.1)",
                        display: "flex", flexDirection: "column",
                    }}>
                        {/* Modal Header */}
                        <div style={{
                            padding: "24px 28px", borderBottom: "1px solid rgba(255,255,255,0.07)",
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            background: "linear-gradient(135deg,rgba(139,92,246,0.1),rgba(236,72,153,0.06))",
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{
                                    width: "40px", height: "40px", borderRadius: "12px",
                                    background: "linear-gradient(135deg,#8b5cf6,#ec4899)",
                                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px",
                                }}>📝</div>
                                <div>
                                    <h3 style={{ fontSize: "20px", fontWeight: "800", color: "white", margin: 0 }}>Report a Civic Issue</h3>
                                    <p style={{ color: "rgba(148,163,184,0.6)", fontSize: "13px", margin: 0 }}>Help improve your community</p>
                                </div>
                            </div>
                            <button onClick={() => setShowModal(false)} style={{
                                width: "36px", height: "36px", borderRadius: "10px",
                                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                                color: "rgba(148,163,184,0.8)", fontSize: "18px", cursor: "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                transition: "all 0.2s ease",
                            }}
                                onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; e.currentTarget.style.color = "#f87171"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(148,163,184,0.8)"; }}
                            >✕</button>
                        </div>
                        <div style={{ overflowY: "auto", padding: "24px 28px" }}>
                            <ReportIssueForm embedded onSuccess={() => { fetchIssues(); setShowModal(false); }} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CitizenDashboard;
