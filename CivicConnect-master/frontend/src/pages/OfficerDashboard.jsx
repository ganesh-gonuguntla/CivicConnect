import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getAssignedIssues, updateIssueStatus } from "../services/api";
import { useAuth } from "../context/AuthContext";

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
.issue-card { animation: fadeInUp 0.5s ease forwards; transition: all 0.35s cubic-bezier(0.34,1.56,0.64,1); }
.issue-card:hover { transform: translateY(-8px); }
.stat-number { animation: countUp 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards; }
.filter-btn { transition: all 0.2s ease; }
.filter-btn:hover { transform: translateY(-2px); }
.action-btn { transition: all 0.2s ease; }
.action-btn:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.1); }
.chat-btn {
  background: linear-gradient(135deg, #f97316, #f59e0b);
  background-size: 200% auto;
  transition: all 0.3s ease;
  position: relative; overflow: hidden;
}
.chat-btn::before {
  content: ''; position: absolute; top: 0; left: -100%;
  width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
  transition: left 0.5s ease;
}
.chat-btn:hover::before { left: 100%; }
.chat-btn:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(249,115,22,0.3) !important; }
`;

/* ── tiny toast ──────────────────────────────────────────────── */
function Toast({ msg, type, onClose }) {
    useEffect(() => {
        const t = setTimeout(onClose, 3000);
        return () => clearTimeout(t);
    }, [onClose]);
    return (
        <div style={{
            position: "fixed", bottom: "24px", right: "24px", zIndex: 50,
            padding: "16px 24px", borderRadius: "16px",
            background: type === "success" ? "rgba(16,185,129,0.95)" : "rgba(239,68,68,0.95)",
            backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)",
            color: "white", fontSize: "14px", fontWeight: "600",
            display: "flex", alignItems: "center", gap: "12px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)", animation: "slideUp 0.3s ease"
        }}>
            <span style={{ fontSize: "18px" }}>{type === "success" ? "✅" : "❌"}</span>
            {msg}
            <button onClick={onClose} style={{
                background: "transparent", border: "none", color: "white", opacity: 0.7,
                fontSize: "20px", cursor: "pointer", marginLeft: "8px", padding: 0
            }} onMouseEnter={e => e.target.style.opacity = 1} onMouseLeave={e => e.target.style.opacity = 0.7}>×</button>
        </div>
    );
}

/* ── Google Maps link helper ─────────────────────────────────── */
function LocationBadge({ location }) {
    if (!location) return null;
    const { lat, lng, address } = location;

    const hasCoords = lat != null && lng != null;
    const mapsUrl = hasCoords
        ? `https://www.google.com/maps?q=${lat},${lng}`
        : address
            ? `https://www.google.com/maps/search/${encodeURIComponent(address)}`
            : null;

    const label = hasCoords
        ? `${parseFloat(lat).toFixed(4)}°, ${parseFloat(lng).toFixed(4)}°`
        : address || null;

    if (!label) return null;

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "rgba(148,163,184,0.7)" }}>
            <span>📍</span>
            {mapsUrl ? (
                <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "#a78bfa", textDecoration: "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "200px" }}
                    onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                    onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}
                >
                    {address || label}
                    {hasCoords && address && (
                        <span style={{ marginLeft: "4px", fontSize: "11px", color: "rgba(148,163,184,0.5)" }}>({label})</span>
                    )}
                </a>
            ) : (
                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "200px" }}>{label}</span>
            )}
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════
   OFFICER DASHBOARD
══════════════════════════════════════════════════════════════ */
function OfficerDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [issues, setIssues] = useState([]);
    const [fetching, setFetching] = useState(true);
    const [comment, setComment] = useState({});
    const [actionLoading, setActionLoading] = useState(null);
    const [expandedImage, setExpandedImage] = useState(null); // lightbox
    const [toast, setToast] = useState(null);
    const [filter, setFilter] = useState("all");

    const showToast = (msg, type = "success") => setToast({ msg, type });

    const fetchIssues = useCallback(async () => {
        try {
            const res = await getAssignedIssues();
            setIssues(res.data);
        } catch (err) {
            console.error("Error fetching officer issues:", err);
            showToast("Failed to load issues", "error");
        } finally {
            setFetching(false);
        }
    }, []);

    useEffect(() => { fetchIssues(); }, [fetchIssues]);

    const handleStatusChange = async (id, newStatus) => {
        setActionLoading(`${id}-${newStatus}`);
        try {
            await updateIssueStatus(id, {
                status: newStatus,
                comment: comment[id]?.trim() || "",
            });
            setComment((prev) => ({ ...prev, [id]: "" }));
            showToast(`Status updated to "${newStatus}"`);
            await fetchIssues();
        } catch (err) {
            showToast(err.response?.data?.msg || "Update failed", "error");
        } finally {
            setActionLoading(null);
        }
    };

    /* ── filtered issues ── */
    const filteredIssues = issues.filter((i) => {
        if (filter === "all") return true;
        return i.status === filter;
    });

    const counts = {
        all: issues.length,
        Pending: issues.filter((i) => i.status === "Pending").length,
        "In Progress": issues.filter((i) => i.status === "In Progress").length,
        Resolved: issues.filter((i) => i.status === "Resolved").length,
    };

    const statusConfig = {
        "Resolved":    { bg: "rgba(16,185,129,0.15)", color: "#34d399", border: "rgba(16,185,129,0.3)", dot: "#10b981" },
        "In Progress": { bg: "rgba(245,158,11,0.15)", color: "#fbbf24", border: "rgba(245,158,11,0.3)", dot: "#f59e0b" },
        "Pending":     { bg: "rgba(239,68,68,0.15)",  color: "#f87171", border: "rgba(239,68,68,0.3)",  dot: "#ef4444" },
    };

    const stats = [
        { label: "Total Assigned", value: counts.all, icon: "📊", gradient: "linear-gradient(135deg,#8b5cf6,#6d28d9)", glow: "rgba(139,92,246,0.35)", delay: "0s" },
        { label: "Resolved",       value: counts.Resolved, icon: "✅", gradient: "linear-gradient(135deg,#10b981,#059669)", glow: "rgba(16,185,129,0.35)", delay: "0.1s" },
        { label: "In Progress",    value: counts["In Progress"], icon: "🔄", gradient: "linear-gradient(135deg,#f59e0b,#d97706)", glow: "rgba(245,158,11,0.35)", delay: "0.2s" },
        { label: "Pending",        value: counts.Pending, icon: "⏳", gradient: "linear-gradient(135deg,#ef4444,#b91c1c)", glow: "rgba(239,68,68,0.35)", delay: "0.3s" },
    ];

    /* ══ render ══════════════════════════════════════════════ */
    return (
        <div style={{ minHeight: "100vh", background: "#09090f", fontFamily: "'Inter',system-ui,sans-serif", paddingBottom: "60px" }}>
            <style>{styles}</style>

            {/* ── HERO SECTION ── */}
            <div className="dash-hero" style={{
                position: "relative", overflow: "hidden", minHeight: "340px",
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
                    background: "radial-gradient(circle,rgba(249,115,22,0.2) 0%,transparent 70%)",
                    animation: "float 8s ease-in-out infinite", zIndex: 1,
                }} />

                {/* Content */}
                <div style={{ position: "relative", zIndex: 2, maxWidth: "1100px", margin: "0 auto", padding: "60px 32px 80px", width: "100%" }}>
                    <div style={{
                        display: "inline-flex", alignItems: "center", gap: "8px",
                        background: "rgba(249,115,22,0.18)", border: "1px solid rgba(249,115,22,0.3)",
                        borderRadius: "100px", padding: "6px 14px", marginBottom: "20px",
                        fontSize: "13px", color: "#fdba74", fontWeight: "600",
                    }}>
                        <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#fb923c", display: "inline-block", animation: "pulse-glow 2s infinite" }} />
                        Officer Dashboard
                    </div>

                    <h1 style={{
                        fontSize: "clamp(36px,5vw,58px)", fontWeight: "900", margin: "0 0 14px",
                        background: "linear-gradient(135deg,#ffffff 0%,#fdba74 60%,#f9a8d4 100%)",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                        lineHeight: 1.1,
                    }}>{user?.department} Department</h1>

                    <p style={{ color: "rgba(203,213,225,0.7)", fontSize: "17px", maxWidth: "520px", marginBottom: "32px", lineHeight: 1.6 }}>
                        Welcome back, {user?.name}. Manage and resolve civic issues assigned to your department.
                    </p>
                </div>
            </div>

            {/* ── MAIN CONTENT ── */}
            <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 32px" }}>
                
                {/* Stats Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "20px", marginTop: "-80px", marginBottom: "48px", position: "relative", zIndex: 5 }}>
                    {stats.map((s) => (
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

                {/* Filter Tabs */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "32px" }}>
                    {["all", "Pending", "In Progress", "Resolved"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className="filter-btn"
                            style={{
                                padding: "10px 20px", borderRadius: "12px", fontSize: "14px", fontWeight: "600", cursor: "pointer",
                                background: filter === f ? "linear-gradient(135deg, #f97316, #f59e0b)" : "rgba(255,255,255,0.05)",
                                color: filter === f ? "white" : "rgba(148,163,184,0.8)",
                                border: filter === f ? "none" : "1px solid rgba(255,255,255,0.1)",
                                boxShadow: filter === f ? "0 8px 20px rgba(249,115,22,0.3)" : "none",
                                fontFamily: "inherit"
                            }}
                        >
                            {f === "all" ? `All (${counts.all})` : `${f} (${counts[f]})`}
                        </button>
                    ))}
                </div>

                {/* Loading skeleton */}
                {fetching && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: "24px" }}>
                        {[1, 2, 3, 4].map((n) => (
                            <div key={n} style={{
                                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
                                borderRadius: "20px", padding: "24px", animation: "pulse-glow 2s infinite"
                            }}>
                                <div style={{ height: "20px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", width: "70%", marginBottom: "16px" }} />
                                <div style={{ height: "14px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", width: "100%", marginBottom: "12px" }} />
                                <div style={{ height: "14px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", width: "80%", marginBottom: "24px" }} />
                                <div style={{ height: "160px", background: "rgba(255,255,255,0.05)", borderRadius: "12px", marginBottom: "16px" }} />
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {!fetching && filteredIssues.length === 0 && (
                    <div style={{
                        background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.1)",
                        borderRadius: "20px", padding: "64px 32px", textAlign: "center",
                    }}>
                        <div style={{ fontSize: "56px", marginBottom: "16px" }}>📋</div>
                        <p style={{ color: "rgba(203,213,225,0.9)", fontSize: "20px", fontWeight: "700", margin: "0 0 8px" }}>No issues found</p>
                        <p style={{ color: "rgba(148,163,184,0.6)", fontSize: "15px", margin: 0 }}>
                            {filter === "all"
                                ? "No issues assigned to your department yet."
                                : `No ${filter.toLowerCase()} issues right now.`}
                        </p>
                    </div>
                )}

                {/* Issue cards */}
                {!fetching && filteredIssues.length > 0 && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: "24px" }}>
                        {filteredIssues.map((issue, idx) => {
                            const sc = statusConfig[issue.status] || statusConfig["Pending"];
                            return (
                                <div key={issue._id} className="issue-card" style={{
                                    background: "rgba(255,255,255,0.04)", backdropFilter: "blur(16px)",
                                    border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", overflow: "hidden",
                                    boxShadow: "0 8px 32px rgba(0,0,0,0.4)", animationDelay: `${idx * 0.08}s`,
                                    display: "flex", flexDirection: "column"
                                }}>
                                    {/* Image */}
                                    {issue.imageURL && (
                                        <div style={{ width: "100%", height: "200px", overflow: "hidden", position: "relative", cursor: "pointer" }}
                                            onClick={() => setExpandedImage(issue.imageURL)} title="Click to enlarge">
                                            <img src={issue.imageURL} alt={issue.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
                                                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"}
                                                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                                            />
                                            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,0.6) 0%,transparent 60%)" }} />
                                            <div style={{ position: "absolute", bottom: "10px", right: "10px", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", padding: "4px 8px", borderRadius: "8px", fontSize: "11px", color: "white" }}>
                                                🔍 Click to enlarge
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Content body */}
                                    <div style={{ padding: "24px", display: "flex", flexDirection: "column", flex: 1 }}>
                                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px", marginBottom: "12px" }}>
                                            <h4 style={{ fontSize: "18px", fontWeight: "700", color: "white", margin: 0, lineHeight: 1.3, flex: 1 }}>
                                                {issue.title}
                                            </h4>
                                            <span style={{
                                                display: "inline-flex", alignItems: "center", gap: "5px",
                                                background: sc.bg, border: `1px solid ${sc.border}`,
                                                color: sc.color, fontSize: "12px", fontWeight: "700",
                                                padding: "4px 10px", borderRadius: "20px", whiteSpace: "nowrap", flexShrink: 0,
                                            }}>
                                                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: sc.dot, display: "inline-block" }} />
                                                {issue.status}
                                            </span>
                                        </div>

                                        <p style={{ color: "rgba(148,163,184,0.7)", fontSize: "14px", lineHeight: 1.6, margin: "0 0 16px" }}>
                                            {issue.description}
                                        </p>

                                        <div style={{ marginBottom: "16px" }}>
                                            <LocationBadge location={issue.location} />
                                        </div>

                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "16px" }}>
                                            <span style={{ background: "rgba(139,92,246,0.15)", color: "#c4b5fd", padding: "4px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: "600" }}>📂 {issue.category}</span>
                                            {issue.createdBy?.name && (
                                                <span style={{ background: "rgba(56,189,248,0.15)", color: "#7dd3fc", padding: "4px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: "600" }}>👤 {issue.createdBy.name}</span>
                                            )}
                                            <span style={{ background: "rgba(148,163,184,0.15)", color: "#cbd5e1", padding: "4px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: "600" }}>
                                                📅 {new Date(issue.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                            </span>
                                        </div>

                                        {/* Past Comments */}
                                        {issue.comments && issue.comments.length > 0 && (
                                            <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: "12px", padding: "16px", marginBottom: "20px", border: "1px solid rgba(255,255,255,0.05)" }}>
                                                <p style={{ fontSize: "11px", fontWeight: "700", color: "rgba(148,163,184,0.8)", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 12px" }}>
                                                    📝 Progress Notes
                                                </p>
                                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                                    {issue.comments.map((c, i) => (
                                                        <div key={i} style={{ borderLeft: "2px solid #8b5cf6", paddingLeft: "12px" }}>
                                                            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                                                                <span style={{ fontSize: "12px", fontWeight: "600", color: "#c4b5fd" }}>{c.by?.name || "Officer"}</span>
                                                                <span style={{ fontSize: "11px", color: "rgba(148,163,184,0.5)" }}>• {new Date(c.at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                                                            </div>
                                                            <p style={{ fontSize: "13px", color: "rgba(203,213,225,0.9)", margin: 0, lineHeight: 1.5 }}>{c.text}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div style={{ marginTop: "auto" }}>
                                            <textarea
                                                placeholder="Add a progress note (optional)…"
                                                value={comment[issue._id] || ""}
                                                onChange={(e) => setComment({ ...comment, [issue._id]: e.target.value })}
                                                rows={2}
                                                style={{
                                                    width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)",
                                                    borderRadius: "12px", padding: "12px 16px", color: "white", fontSize: "14px",
                                                    resize: "none", marginBottom: "16px", outline: "none", fontFamily: "inherit", boxSizing: "border-box"
                                                }}
                                                onFocus={e => e.target.style.borderColor = "rgba(139,92,246,0.5)"}
                                                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                                            />

                                            <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
                                                <ActionBtn
                                                    label="⏳ In Progress"
                                                    disabled={issue.status === "In Progress"}
                                                    loading={actionLoading === `${issue._id}-In Progress`}
                                                    bg="rgba(245,158,11,0.15)"
                                                    color="#fbbf24"
                                                    border="rgba(245,158,11,0.3)"
                                                    onClick={() => handleStatusChange(issue._id, "In Progress")}
                                                />
                                                <ActionBtn
                                                    label="✅ Resolve"
                                                    disabled={issue.status === "Resolved"}
                                                    loading={actionLoading === `${issue._id}-Resolved`}
                                                    bg="rgba(16,185,129,0.15)"
                                                    color="#34d399"
                                                    border="rgba(16,185,129,0.3)"
                                                    onClick={() => handleStatusChange(issue._id, "Resolved")}
                                                />
                                            </div>

                                            <button
                                                onClick={() => navigate(`/chat/${issue._id}`)}
                                                className="chat-btn"
                                                style={{
                                                    width: "100%", padding: "12px", borderRadius: "12px", border: "none",
                                                    fontSize: "14px", fontWeight: "700", color: "white", cursor: "pointer",
                                                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                                                    fontFamily: "inherit"
                                                }}
                                            >
                                                <span style={{ fontSize: "16px" }}>💬</span> Chat with Citizen
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Lightbox ── */}
            {expandedImage && (
                <div
                    style={{
                        position: "fixed", inset: 0, zIndex: 60,
                        background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)",
                        display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
                    }}
                    onClick={() => setExpandedImage(null)}
                >
                    <div style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh" }} onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setExpandedImage(null)}
                            style={{
                                position: "absolute", top: "-16px", right: "-16px",
                                width: "36px", height: "36px", borderRadius: "50%",
                                background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
                                color: "white", fontSize: "18px", fontWeight: "bold",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                cursor: "pointer", backdropFilter: "blur(4px)", transition: "all 0.2s ease"
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
                            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                        >
                            ✕
                        </button>
                        <img
                            src={expandedImage}
                            alt="Enlarged"
                            style={{ maxWidth: "100%", maxHeight: "90vh", objectFit: "contain", borderRadius: "16px", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}
                        />
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}

/* ── small action button ─────────────────────────────────────── */
function ActionBtn({ label, disabled, loading, bg, color, border, onClick }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            className="action-btn"
            style={{
                flex: 1, padding: "10px", borderRadius: "10px",
                background: disabled ? "rgba(255,255,255,0.05)" : bg,
                color: disabled ? "rgba(255,255,255,0.3)" : color,
                border: `1px solid ${disabled ? "rgba(255,255,255,0.05)" : border}`,
                fontSize: "13px", fontWeight: "700", cursor: disabled || loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                fontFamily: "inherit"
            }}
        >
            {loading ? (
                <svg style={{ animation: "spin 1s linear infinite", height: "16px", width: "16px", color: "inherit" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
            ) : label}
        </button>
    );
}

export default OfficerDashboard;
