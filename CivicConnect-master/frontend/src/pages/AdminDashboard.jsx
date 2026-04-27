import { useEffect, useState, useCallback } from "react";
import { getAllIssues, getPendingOfficers, updateOfficerStatus, deleteIssue } from "../services/api";
import { PieChart, Pie, Cell, Legend, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#8b5cf6", "#fbbf24", "#10b981", "#f87171"];

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
@keyframes countUp {
  from { opacity: 0; transform: scale(0.5); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(139,92,246,0.3); }
  50% { box-shadow: 0 0 40px rgba(139,92,246,0.6); }
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

.dash-hero { animation: fadeInUp 0.6s ease forwards; }
.stat-card { animation: fadeInUp 0.6s ease forwards; transition: all 0.3s ease; }
.stat-card:hover { transform: translateY(-6px) scale(1.02); }
.stat-number { animation: countUp 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards; }
.tab-btn { transition: all 0.2s ease; }
.tab-btn:hover { transform: translateY(-2px); }
.action-btn { transition: all 0.2s ease; }
.action-btn:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.1); }
`;

/* ── tiny toast component ──────────────────────────────────────── */
function Toast({ msg, type, onClose }) {
    useEffect(() => {
        const t = setTimeout(onClose, 3500);
        return () => clearTimeout(t);
    }, [onClose]);

    return (
        <div style={{
            position: "fixed", bottom: "24px", right: "24px", zIndex: 50,
            padding: "16px 24px", borderRadius: "16px",
            background: type === "success" ? "rgba(16,185,129,0.95)" : type === "error" ? "rgba(239,68,68,0.95)" : "rgba(139,92,246,0.95)",
            backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)",
            color: "white", fontSize: "14px", fontWeight: "600",
            display: "flex", alignItems: "center", gap: "12px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)", animation: "slideUp 0.3s ease"
        }}>
            <span style={{ fontSize: "18px" }}>{type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"}</span>
            {msg}
            <button onClick={onClose} style={{
                background: "transparent", border: "none", color: "white", opacity: 0.7,
                fontSize: "20px", cursor: "pointer", marginLeft: "8px", padding: 0
            }} onMouseEnter={e => e.target.style.opacity = 1} onMouseLeave={e => e.target.style.opacity = 0.7}>×</button>
        </div>
    );
}

/* ── department color map ───────────────────────────────────────── */
const deptColor = {
    Roads: { bg: "rgba(139,92,246,0.15)", text: "#c4b5fd" },
    Water: { bg: "rgba(56,189,248,0.15)", text: "#7dd3fc" },
    Sanitation: { bg: "rgba(16,185,129,0.15)", text: "#6ee7b7" },
    Electricity: { bg: "rgba(245,158,11,0.15)", text: "#fcd34d" },
};

/* ══════════════════════════════════════════════════════════════════
   ADMIN DASHBOARD
══════════════════════════════════════════════════════════════════ */
function AdminDashboard() {
    /* ── state ── */
    const [activeTab, setActiveTab] = useState("overview"); // "overview" | "issues" | "approvals"
    const [issues, setIssues] = useState([]);
    const [pendingOfficers, setPendingOfficers] = useState([]);
    const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0 });
    const [byCategory, setByCategory] = useState([]);
    const [actionLoading, setActionLoading] = useState(null); // officer id being actioned
    const [deleteLoading, setDeleteLoading] = useState(null); // issue id being deleted
    const [confirmModal, setConfirmModal] = useState(null); // { id, title }
    const [toast, setToast] = useState(null); // { msg, type }

    /* ── helpers ── */
    const showToast = useCallback((msg, type = "success") => setToast({ msg, type }), []);

    /* ── data fetching ── */
    const fetchData = useCallback(async () => {
        try {
            const [issuesRes, officersRes] = await Promise.all([
                getAllIssues(),
                getPendingOfficers(),
            ]);

            const data = issuesRes.data;
            setIssues(data);

            const resolved = data.filter((i) => i.status === "Resolved").length;
            const pending = data.filter((i) => i.status !== "Resolved").length;

            const categoryCounts = {};
            data.forEach((i) => {
                categoryCounts[i.category] = (categoryCounts[i.category] || 0) + 1;
            });

            setStats({ total: data.length, resolved, pending });
            setByCategory(
                Object.entries(categoryCounts).map(([name, value]) => ({ name, value }))
            );

            setPendingOfficers(officersRes.data);
        } catch {
            showToast("Failed to load dashboard data", "error");
        }
    }, [showToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDeleteIssue = async (id) => {
        setConfirmModal(null);
        setDeleteLoading(id);
        try {
            await deleteIssue(id);
            setIssues((prev) => prev.filter((i) => i._id !== id));
            // update stats live
            setStats((prev) => ({
                ...prev,
                total: prev.total - 1,
            }));
            showToast("Issue deleted successfully", "success");
        } catch (err) {
            showToast(err.response?.data?.msg || "Failed to delete issue", "error");
        } finally {
            setDeleteLoading(null);
        }
    };

    const handleOfficerStatus = async (id, status) => {
        setActionLoading(id);
        try {
            await updateOfficerStatus(id, status);
            setPendingOfficers((prev) => prev.filter((o) => o._id !== id));
            showToast(`Officer ${status} successfully!`, "success");
        } catch (err) {
            showToast(err.response?.data?.msg || "Failed to update officer status", "error");
        } finally {
            setActionLoading(null);
        }
    };

    /* ── tab config ── */
    const tabs = [
        { id: "overview", label: "📊 Overview" },
        { id: "issues", label: "📋 All Issues" },
        {
            id: "approvals",
            label: "👮 Officer Approvals",
            badge: pendingOfficers.length > 0 ? pendingOfficers.length : null,
        },
    ];

    const statCards = [
        { label: "Total Issues", value: stats.total, icon: "📋", gradient: "linear-gradient(135deg,#8b5cf6,#6d28d9)", glow: "rgba(139,92,246,0.35)", delay: "0s" },
        { label: "Resolved",       value: stats.resolved, icon: "✅", gradient: "linear-gradient(135deg,#10b981,#059669)", glow: "rgba(16,185,129,0.35)", delay: "0.1s" },
        { label: "Pending",        value: stats.pending, icon: "⏳", gradient: "linear-gradient(135deg,#ef4444,#b91c1c)", glow: "rgba(239,68,68,0.35)", delay: "0.2s" },
    ];

    /* ══ render ══════════════════════════════════════════════════ */
    return (
        <div style={{ minHeight: "100vh", background: "#09090f", fontFamily: "'Inter',system-ui,sans-serif", paddingBottom: "60px" }}>
            <style>{styles}</style>

            {/* ── HERO SECTION ── */}
            <div className="dash-hero" style={{
                position: "relative", overflow: "hidden", minHeight: "260px",
                display: "flex", alignItems: "center", marginBottom: "40px"
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
                    background: "radial-gradient(circle,rgba(236,72,153,0.2) 0%,transparent 70%)",
                    animation: "float 8s ease-in-out infinite", zIndex: 1,
                }} />

                {/* Content */}
                <div style={{ position: "relative", zIndex: 2, maxWidth: "1100px", margin: "0 auto", padding: "60px 32px 40px", width: "100%" }}>
                    <div style={{
                        display: "inline-flex", alignItems: "center", gap: "8px",
                        background: "rgba(236,72,153,0.18)", border: "1px solid rgba(236,72,153,0.3)",
                        borderRadius: "100px", padding: "6px 14px", marginBottom: "20px",
                        fontSize: "13px", color: "#f9a8d4", fontWeight: "600",
                    }}>
                        <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#ec4899", display: "inline-block", animation: "pulse-glow 2s infinite" }} />
                        System Administration
                    </div>

                    <h1 style={{
                        fontSize: "clamp(36px,5vw,58px)", fontWeight: "900", margin: "0 0 14px",
                        background: "linear-gradient(135deg,#ffffff 0%,#f9a8d4 60%,#c4b5fd 100%)",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                        lineHeight: 1.1,
                    }}>Admin Dashboard</h1>
                </div>
            </div>

            {/* ── MAIN CONTENT ── */}
            <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 32px" }}>
                
                {/* Tabs */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "40px" }}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className="tab-btn"
                            style={{
                                display: "flex", alignItems: "center", gap: "8px",
                                padding: "12px 24px", borderRadius: "12px", fontSize: "14px", fontWeight: "600", cursor: "pointer",
                                background: activeTab === tab.id ? "linear-gradient(135deg, #ec4899, #8b5cf6)" : "rgba(255,255,255,0.05)",
                                color: activeTab === tab.id ? "white" : "rgba(148,163,184,0.8)",
                                border: activeTab === tab.id ? "none" : "1px solid rgba(255,255,255,0.1)",
                                boxShadow: activeTab === tab.id ? "0 8px 20px rgba(236,72,153,0.3)" : "none",
                                fontFamily: "inherit"
                            }}
                        >
                            {tab.label}
                            {tab.badge && (
                                <span style={{
                                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                                    background: "rgba(255,255,255,0.2)", borderRadius: "20px", padding: "2px 8px",
                                    fontSize: "11px", fontWeight: "800", color: "white"
                                }}>
                                    {tab.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* ════════════════════════════════
                    TAB: OVERVIEW
                ════════════════════════════════ */}
                {activeTab === "overview" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
                        {/* Stats Cards */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "20px" }}>
                            {statCards.map((s) => (
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

                        {/* Charts */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: "24px" }}>
                            <div style={{
                                background: "rgba(255,255,255,0.04)", backdropFilter: "blur(16px)",
                                border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "32px",
                                boxShadow: "0 8px 32px rgba(0,0,0,0.4)", display: "flex", flexDirection: "column", alignItems: "center"
                            }}>
                                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "white", alignSelf: "flex-start", margin: "0 0 24px" }}>📊 Issue Categories</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie data={byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={{ fill: 'white', fontSize: 12 }}>
                                            {byCategory.map((_, i) => (
                                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ background: "rgba(15,10,35,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "white" }} itemStyle={{ color: "white" }} />
                                        <Legend wrapperStyle={{ color: "white" }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            <div style={{
                                background: "rgba(255,255,255,0.04)", backdropFilter: "blur(16px)",
                                border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "32px",
                                boxShadow: "0 8px 32px rgba(0,0,0,0.4)", display: "flex", flexDirection: "column", alignItems: "center"
                            }}>
                                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "white", alignSelf: "flex-start", margin: "0 0 24px" }}>📈 Resolved vs Pending</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={[stats]}>
                                        <XAxis dataKey="total" hide />
                                        <YAxis hide />
                                        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: "rgba(15,10,35,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "white" }} itemStyle={{ color: "white" }} />
                                        <Bar dataKey="resolved" fill="#10b981" radius={[8, 8, 0, 0]} name="Resolved" />
                                        <Bar dataKey="pending" fill="#ef4444" radius={[8, 8, 0, 0]} name="Pending" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {/* ════════════════════════════════
                    TAB: ALL ISSUES
                ════════════════════════════════ */}
                {activeTab === "issues" && (
                    <div>
                        <h3 style={{ fontSize: "24px", fontWeight: "800", color: "white", marginBottom: "24px" }}>📋 All Reported Issues</h3>
                        <div style={{ overflowX: "auto", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", backdropFilter: "blur(12px)" }}>
                            <table style={{ width: "100%", textAlign: "left", fontSize: "14px", borderCollapse: "collapse" }}>
                                <thead style={{ background: "rgba(255,255,255,0.05)", color: "rgba(148,163,184,0.9)" }}>
                                    <tr>
                                        <th style={{ padding: "16px 20px", fontWeight: "700", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>Title</th>
                                        <th style={{ padding: "16px 20px", fontWeight: "700", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>Category</th>
                                        <th style={{ padding: "16px 20px", fontWeight: "700", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>Status</th>
                                        <th style={{ padding: "16px 20px", fontWeight: "700", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>Department</th>
                                        <th style={{ padding: "16px 20px", fontWeight: "700", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>Created By</th>
                                        <th style={{ padding: "16px 20px", fontWeight: "700", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>Feedback</th>
                                        <th style={{ padding: "16px 20px", fontWeight: "700", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {issues.length === 0 && (
                                        <tr>
                                            <td colSpan="7" style={{ padding: "32px", textAlign: "center", color: "rgba(148,163,184,0.6)", fontStyle: "italic" }}>No issues found.</td>
                                        </tr>
                                    )}
                                    {issues.map((i) => (
                                        <tr key={i._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.03)"} onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                                            <td style={{ padding: "16px 20px", color: "white", fontWeight: "600", maxWidth: "200px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{i.title}</td>
                                            <td style={{ padding: "16px 20px" }}>
                                                <span style={{ background: "rgba(139,92,246,0.15)", color: "#c4b5fd", padding: "4px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" }}>
                                                    {i.category}
                                                </span>
                                            </td>
                                            <td style={{ padding: "16px 20px" }}>
                                                <span style={{
                                                    padding: "4px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: "700",
                                                    background: i.status === "Resolved" ? "rgba(16,185,129,0.15)" : i.status === "Pending" ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)",
                                                    color: i.status === "Resolved" ? "#34d399" : i.status === "Pending" ? "#f87171" : "#fbbf24",
                                                }}>
                                                    {i.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: "16px 20px", color: "rgba(203,213,225,0.8)" }}>{i.department}</td>
                                            <td style={{ padding: "16px 20px", color: "rgba(203,213,225,0.8)" }}>
                                                {i.createdBy?.name || "—"}
                                            </td>
                                            <td style={{ padding: "16px 20px" }}>
                                                {i.feedback?.submitted ? (
                                                    <div>
                                                        <div style={{ display: "flex", gap: "2px" }}>
                                                            {[1,2,3,4,5].map(s => (
                                                                <span key={s} style={{ fontSize: "14px", color: s <= i.feedback.rating ? "#fbbf24" : "rgba(255,255,255,0.1)" }}>★</span>
                                                            ))}
                                                        </div>
                                                        {i.feedback.comment && (
                                                            <p style={{ fontSize: "12px", color: "rgba(148,163,184,0.7)", margin: "4px 0 0", maxWidth: "160px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={i.feedback.comment}>
                                                                {i.feedback.comment}
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "12px" }}>—</span>
                                                )}
                                            </td>
                                            <td style={{ padding: "16px 20px" }}>
                                                <button
                                                    onClick={() => setConfirmModal({ id: i._id, title: i.title })}
                                                    disabled={deleteLoading === i._id}
                                                    style={{
                                                        display: "flex", alignItems: "center", gap: "6px",
                                                        padding: "6px 12px", background: "rgba(239,68,68,0.1)",
                                                        color: "#f87171", border: "1px solid rgba(239,68,68,0.3)",
                                                        borderRadius: "8px", fontSize: "12px", fontWeight: "700",
                                                        cursor: deleteLoading === i._id ? "not-allowed" : "pointer", opacity: deleteLoading === i._id ? 0.5 : 1,
                                                        fontFamily: "inherit", transition: "all 0.2s"
                                                    }}
                                                    onMouseEnter={e => !deleteLoading && (e.currentTarget.style.background = "rgba(239,68,68,0.2)")}
                                                    onMouseLeave={e => !deleteLoading && (e.currentTarget.style.background = "rgba(239,68,68,0.1)")}
                                                >
                                                    {deleteLoading === i._id ? (
                                                        <svg style={{ animation: "spin 1s linear infinite", height: "14px", width: "14px", color: "inherit" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                                        </svg>
                                                    ) : "🗑️ Delete"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ════════════════════════════════
                    TAB: OFFICER APPROVALS
                ════════════════════════════════ */}
                {activeTab === "approvals" && (
                    <div>
                        <h3 style={{ fontSize: "24px", fontWeight: "800", color: "white", marginBottom: "24px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "16px" }}>Pending Officer Approvals</h3>

                        {pendingOfficers.length === 0 ? (
                            <div style={{
                                background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)",
                                borderRadius: "16px", padding: "32px", textAlign: "center", color: "#34d399",
                                fontSize: "16px", fontWeight: "600", backdropFilter: "blur(8px)"
                            }}>
                                🎉 Awesome! All officers have been reviewed. There are no pending approvals.
                            </div>
                        ) : (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: "24px" }}>
                                {pendingOfficers.map((o) => (
                                    <div key={o._id} style={{
                                        background: "rgba(255,255,255,0.04)", backdropFilter: "blur(16px)",
                                        border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", overflow: "hidden",
                                        display: "flex", flexDirection: "column", boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
                                    }}>
                                        <div style={{ padding: "24px", borderBottom: "1px solid rgba(255,255,255,0.05)", flex: 1 }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                                                    <div style={{
                                                        width: "48px", height: "48px", borderRadius: "50%",
                                                        background: "linear-gradient(135deg, #f97316, #f59e0b)",
                                                        color: "white", display: "flex", alignItems: "center", justifyContent: "center",
                                                        fontSize: "20px", fontWeight: "800", boxShadow: "0 4px 12px rgba(249,115,22,0.3)"
                                                    }}>
                                                        {o.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h4 style={{ fontSize: "18px", fontWeight: "700", color: "white", margin: "0 0 4px" }}>{o.name}</h4>
                                                        <p style={{ color: "rgba(148,163,184,0.7)", fontSize: "13px", margin: 0 }}>{o.email}</p>
                                                    </div>
                                                </div>
                                                <span style={{ background: "rgba(245,158,11,0.15)", color: "#fbbf24", fontSize: "11px", fontWeight: "800", padding: "4px 10px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                                    Pending
                                                </span>
                                            </div>
                                            <div>
                                                <p style={{ fontSize: "12px", fontWeight: "600", color: "rgba(148,163,184,0.6)", textTransform: "uppercase", marginBottom: "8px" }}>Department</p>
                                                <span style={{
                                                    padding: "6px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: "700",
                                                    background: deptColor[o.department]?.bg || "rgba(255,255,255,0.1)",
                                                    color: deptColor[o.department]?.text || "rgba(203,213,225,0.9)",
                                                    display: "inline-block"
                                                }}>
                                                    {o.department || "General"}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ background: "rgba(0,0,0,0.2)", padding: "16px 24px", display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                                            <button
                                                onClick={() => handleOfficerStatus(o._id, "rejected")}
                                                disabled={actionLoading === o._id}
                                                style={{
                                                    padding: "8px 16px", background: "transparent", border: "1px solid rgba(239,68,68,0.5)",
                                                    color: "#f87171", borderRadius: "10px", fontSize: "13px", fontWeight: "700",
                                                    cursor: actionLoading === o._id ? "not-allowed" : "pointer", opacity: actionLoading === o._id ? 0.5 : 1,
                                                    transition: "all 0.2s"
                                                }}
                                                onMouseEnter={e => !actionLoading && (e.currentTarget.style.background = "rgba(239,68,68,0.1)")}
                                                onMouseLeave={e => !actionLoading && (e.currentTarget.style.background = "transparent")}
                                            >
                                                Reject
                                            </button>
                                            <button
                                                onClick={() => handleOfficerStatus(o._id, "approved")}
                                                disabled={actionLoading === o._id}
                                                style={{
                                                    padding: "8px 16px", background: "linear-gradient(135deg, #10b981, #059669)", border: "none",
                                                    color: "white", borderRadius: "10px", fontSize: "13px", fontWeight: "700",
                                                    cursor: actionLoading === o._id ? "not-allowed" : "pointer", opacity: actionLoading === o._id ? 0.5 : 1,
                                                    boxShadow: "0 4px 12px rgba(16,185,129,0.3)", transition: "transform 0.2s"
                                                }}
                                            >
                                                {actionLoading === o._id ? "Processing…" : "Approve"}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Confirm Delete Modal */}
            {confirmModal && (
                <ConfirmModal
                    title={confirmModal.title}
                    onConfirm={() => handleDeleteIssue(confirmModal.id)}
                    onCancel={() => setConfirmModal(null)}
                />
            )}

            {/* Toast */}
            {toast && (
                <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />
            )}
        </div>
    );
}

/* ── Confirmation Modal ─────────────────────────────────────────── */
function ConfirmModal({ title, onConfirm, onCancel }) {
    return (
        <div style={{
            position: "fixed", inset: 0, zIndex: 60,
            background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
        }}>
            <div style={{
                background: "rgba(15,10,35,0.95)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "24px", padding: "32px", width: "100%", maxWidth: "440px",
                boxShadow: "0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,92,246,0.1)",
                animation: "slideUp 0.3s ease"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
                    <span style={{ fontSize: "36px" }}>⚠️</span>
                    <h3 style={{ fontSize: "22px", fontWeight: "800", color: "white", margin: 0 }}>Delete Issue?</h3>
                </div>
                <p style={{ color: "rgba(203,213,225,0.8)", fontSize: "15px", marginBottom: "16px", lineHeight: 1.5 }}>
                    Are you sure you want to permanently delete this issue?
                </p>
                <div style={{
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px", padding: "12px 16px", marginBottom: "24px",
                    color: "rgba(148,163,184,0.9)", fontSize: "14px", fontStyle: "italic",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                }}>
                    "{title}"
                </div>
                <p style={{ color: "#f87171", fontSize: "13px", fontWeight: "600", marginBottom: "24px" }}>
                    ⚠️ This action cannot be undone.
                </p>
                <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                    <button
                        onClick={onCancel}
                        style={{
                            padding: "10px 20px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                            color: "white", borderRadius: "12px", fontSize: "14px", fontWeight: "600", cursor: "pointer", transition: "background 0.2s"
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{
                            padding: "10px 20px", background: "linear-gradient(135deg, #ef4444, #b91c1c)", border: "none",
                            color: "white", borderRadius: "12px", fontSize: "14px", fontWeight: "600", cursor: "pointer",
                            boxShadow: "0 4px 12px rgba(239,68,68,0.3)"
                        }}
                    >
                        Yes, Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;

