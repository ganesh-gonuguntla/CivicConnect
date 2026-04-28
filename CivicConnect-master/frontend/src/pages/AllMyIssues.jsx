import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyIssues, submitFeedback } from "../services/api";

/* ── Star-rating feedback form ── */
function FeedbackForm({ issue, onSubmitted }) {
    const [rating, setRating] = useState(0);
    const [hovered, setHovered] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) { setError("Please select a star rating."); return; }
        setSubmitting(true); setError("");
        try {
            await submitFeedback(issue._id, { rating, comment });
            onSubmitted({ rating, comment, submittedAt: new Date().toISOString() });
        } catch (err) {
            setError(err.response?.data?.msg || "Failed to submit feedback.");
        } finally { setSubmitting(false); }
    };

    const labels = ["Poor", "Fair", "Good", "Very Good", "Excellent"];

    return (
        <form onSubmit={handleSubmit} style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,.08)" }}>
            <h4 style={{ fontSize: "14px", fontWeight: "700", color: "white", marginBottom: "14px" }}>⭐ Rate This Resolution</h4>
            <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "14px" }}>
                {[1,2,3,4,5].map(s => (
                    <button key={s} type="button" onClick={() => setRating(s)}
                        onMouseEnter={() => setHovered(s)} onMouseLeave={() => setHovered(0)}
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: "28px",
                            color: s <= (hovered || rating) ? "#fbbf24" : "rgba(255,255,255,.2)",
                            transition: "all .2s ease", transform: s <= (hovered || rating) ? "scale(1.2)" : "scale(1)" }}>★</button>
                ))}
                {rating > 0 && <span style={{ fontSize: "13px", color: "#fbbf24", fontWeight: "600", marginLeft: "4px" }}>{labels[rating-1]}</span>}
            </div>
            <textarea value={comment} onChange={e => setComment(e.target.value)}
                placeholder="Share your experience (optional)…" rows={3}
                className="cc-input" style={{ resize: "none", marginBottom: "12px", display: "block" }} />
            {error && <p style={{ color: "#f87171", fontSize: "12px", marginBottom: "10px" }}>{error}</p>}
            <button type="submit" disabled={submitting} className="btn-violet" style={{ width: "100%" }}>
                {submitting ? "Submitting…" : "Submit Feedback"}
            </button>
        </form>
    );
}

/* ── Status helpers ── */
const SC = {
    Resolved:    { cls: "status-resolved", dot: "#10b981" },
    "In Progress":{ cls: "status-progress", dot: "#f59e0b" },
    Pending:     { cls: "status-pending",   dot: "#ef4444" },
};

/* ── Filter tab config ── */
const FILTERS = [
    { key: "all",         label: "All",         color: "#8b5cf6" },
    { key: "Pending",     label: "Pending",     color: "#ef4444" },
    { key: "In Progress", label: "In Progress", color: "#f59e0b" },
    { key: "Resolved",    label: "Resolved",    color: "#10b981" },
];

function AllMyIssues() {
    const navigate = useNavigate();
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [selectedIssue, setSelectedIssue] = useState(null);

    const fetchIssues = async () => {
        try {
            setLoading(true);
            const res = await getMyIssues();
            setIssues(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchIssues(); }, []);

    const filteredIssues = filter === "all" ? issues : issues.filter(i => i.status === filter);
    const count = (key) => key === "all" ? issues.length : issues.filter(i => i.status === key).length;

    const sc = (status) => SC[status] || SC["Pending"];

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg-base)", fontFamily: "'Inter',system-ui,sans-serif" }}>

            {/* ── PAGE HEADER ── */}
            <div style={{ position: "relative", overflow: "hidden", padding: "48px 0 56px", background: "linear-gradient(135deg,rgba(139,92,246,.12) 0%,rgba(15,10,40,.6) 100%)", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
                <div style={{ position: "absolute", inset: 0, backgroundImage: "url(/dashboard-bg.png)", backgroundSize: "cover", backgroundPosition: "center 30%", opacity: 0.12, zIndex: 0 }} />
                <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "320px", height: "320px", borderRadius: "50%", background: "radial-gradient(circle,rgba(139,92,246,.18) 0%,transparent 70%)", zIndex: 0 }} />
                <div className="anim-fadeInUp" style={{ position: "relative", zIndex: 1, maxWidth: "1100px", margin: "0 auto", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
                    <div>
                        <div style={{ fontSize: "12px", fontWeight: "600", letterSpacing: "2.5px", textTransform: "uppercase", color: "rgba(167,139,250,.8)", marginBottom: "8px" }}>My Reports</div>
                        <h1 style={{ fontSize: "clamp(28px,4vw,42px)", fontWeight: "900", background: "linear-gradient(135deg,#fff,#c4b5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: "6px" }}>All Your Issues</h1>
                        <p style={{ color: "rgba(148,163,184,.65)", fontSize: "15px" }}>Track and manage all issues you've reported to the city</p>
                    </div>
                    <button onClick={() => navigate("/citizen")} className="btn-ghost">
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
                        Back to Dashboard
                    </button>
                </div>
            </div>

            <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 32px 64px" }}>

                {/* ── FILTER TABS ── */}
                <div className="anim-fadeInUp delay-1" style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "32px" }}>
                    {FILTERS.map(f => {
                        const active = filter === f.key;
                        return (
                            <button key={f.key} onClick={() => setFilter(f.key)} style={{
                                padding: "9px 18px", borderRadius: "10px", fontWeight: "700", fontSize: "13px",
                                border: active ? "1px solid transparent" : "1px solid rgba(255,255,255,.1)",
                                background: active ? f.color : "rgba(255,255,255,.04)",
                                color: active ? "white" : "rgba(203,213,225,.7)",
                                cursor: "pointer", fontFamily: "inherit",
                                boxShadow: active ? `0 4px 14px ${f.color}44` : "none",
                                transition: "all .25s ease",
                            }}
                                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,.08)"; e.currentTarget.style.color = "white"; }}}
                                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,.04)"; e.currentTarget.style.color = "rgba(203,213,225,.7)"; }}}
                            >
                                {f.label} <span style={{ opacity: .75, marginLeft: "2px" }}>({count(f.key)})</span>
                            </button>
                        );
                    })}
                </div>

                {/* ── CONTENT ── */}
                {loading ? (
                    <div style={{ textAlign: "center", padding: "80px 0" }}>
                        <svg className="anim-spin" style={{ margin: "0 auto 16px", display: "block" }} width="40" height="40" fill="none" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" stroke="rgba(139,92,246,.25)" strokeWidth="3"/>
                            <path d="M12 2a10 10 0 0110 10" stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round"/>
                        </svg>
                        <p style={{ color: "rgba(148,163,184,.6)", fontSize: "15px" }}>Loading your issues…</p>
                    </div>
                ) : filteredIssues.length === 0 ? (
                    <div className="glass-card anim-scaleIn" style={{ padding: "64px 32px", textAlign: "center" }}>
                        <div style={{ fontSize: "52px", marginBottom: "16px" }}>📋</div>
                        <p style={{ color: "rgba(203,213,225,.75)", fontSize: "18px", fontWeight: "700", marginBottom: "6px" }}>
                            {filter === "all" ? "No issues reported yet" : `No ${filter.toLowerCase()} issues`}
                        </p>
                        <p style={{ color: "rgba(148,163,184,.5)", fontSize: "14px" }}>Report a civic issue to get started</p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {filteredIssues.map((issue, idx) => {
                            const s = sc(issue.status);
                            return (
                                <div key={issue._id} className={`glass-card anim-fadeInUp delay-${Math.min(idx+1,4)}`}
                                    onClick={() => setSelectedIssue(issue)}
                                    style={{
                                        cursor: "pointer", overflow: "hidden",
                                        transition: "all .3s cubic-bezier(.34,1.56,.64,1)",
                                        borderColor: "rgba(255,255,255,.07)",
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,.5)"; e.currentTarget.style.borderColor = "rgba(139,92,246,.25)"; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; e.currentTarget.style.borderColor = "rgba(255,255,255,.07)"; }}
                                >
                                    <div style={{ display: "flex", flexDirection: "row", minHeight: "160px" }}>
                                        {/* Image */}
                                        {issue.imageURL && (
                                            <div style={{ width: "200px", flexShrink: 0, overflow: "hidden", position: "relative" }}>
                                                <img src={issue.imageURL} alt={issue.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .4s ease" }}
                                                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.06)"}
                                                    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}/>
                                                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right,transparent 60%,rgba(15,10,35,.4) 100%)" }} />
                                            </div>
                                        )}
                                        {/* Content */}
                                        <div style={{ flex: 1, padding: "22px 26px", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "14px" }}>
                                            <div>
                                                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "8px" }}>
                                                    <h3 style={{ fontSize: "18px", fontWeight: "800", color: "white", lineHeight: 1.3, flex: 1 }}>{issue.title}</h3>
                                                    <span className={`status-pill ${s.cls}`}>
                                                        <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: s.dot, display: "inline-block", flexShrink: 0 }}/>
                                                        {issue.status}
                                                    </span>
                                                </div>
                                                <p style={{ color: "rgba(148,163,184,.65)", fontSize: "14px", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{issue.description}</p>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                                                {/* Meta pills */}
                                                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                                    <span style={{ background: "var(--violet-dim)", border: "1px solid rgba(139,92,246,.25)", color: "rgba(196,181,253,.9)", fontSize: "12px", fontWeight: "600", padding: "4px 10px", borderRadius: "20px" }}>{issue.category}</span>
                                                    {issue.location?.address && <span style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(148,163,184,.7)", fontSize: "12px", fontWeight: "500", padding: "4px 10px", borderRadius: "20px" }}>📍 {issue.location.address}</span>}
                                                    {issue.createdAt && <span style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(148,163,184,.7)", fontSize: "12px", fontWeight: "500", padding: "4px 10px", borderRadius: "20px" }}>📅 {new Date(issue.createdAt).toLocaleDateString()}</span>}
                                                    {issue.assignedOfficer?.name && <span style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(148,163,184,.7)", fontSize: "12px", fontWeight: "500", padding: "4px 10px", borderRadius: "20px" }}>👤 {issue.assignedOfficer.name}</span>}
                                                </div>
                                                {/* Chat btn */}
                                                {issue.assignedOfficer?._id && (
                                                    <button className="btn-primary" style={{ padding: "8px 16px", fontSize: "13px" }}
                                                        onClick={e => { e.stopPropagation(); navigate(`/chat/${issue._id}`); }}>
                                                        💬 Chat with Officer
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── DETAIL MODAL ── */}
            {selectedIssue && (
                <div className="anim-fadeIn" onClick={e => { if (e.target === e.currentTarget) setSelectedIssue(null); }}
                    style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,.75)", backdropFilter: "blur(14px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
                    <div className="anim-scaleIn" style={{
                        background: "rgba(15,10,35,.95)", backdropFilter: "blur(24px)",
                        border: "1px solid rgba(255,255,255,.1)", borderRadius: "24px",
                        width: "100%", maxWidth: "600px", maxHeight: "90vh", overflow: "hidden",
                        boxShadow: "0 30px 80px rgba(0,0,0,.7)",
                        display: "flex", flexDirection: "column",
                    }}>
                        {/* Modal header */}
                        <div style={{ padding: "22px 28px", borderBottom: "1px solid rgba(255,255,255,.07)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", background: "linear-gradient(135deg,rgba(139,92,246,.1),rgba(236,72,153,.06))", flexShrink: 0 }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h3 style={{ fontSize: "18px", fontWeight: "800", color: "white", marginBottom: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedIssue.title}</h3>
                                <span className={`status-pill ${sc(selectedIssue.status).cls}`}>
                                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: sc(selectedIssue.status).dot, display: "inline-block" }}/>{selectedIssue.status}
                                </span>
                            </div>
                            <button onClick={() => setSelectedIssue(null)} style={{
                                width: "34px", height: "34px", borderRadius: "10px", flexShrink: 0,
                                background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)",
                                color: "rgba(148,163,184,.8)", fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                            }}
                                onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,.15)"; e.currentTarget.style.color = "#f87171"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.06)"; e.currentTarget.style.color = "rgba(148,163,184,.8)"; }}>✕</button>
                        </div>

                        {/* Scrollable body */}
                        <div style={{ overflowY: "auto", padding: "24px 28px" }}>
                            {selectedIssue.imageURL && (
                                <div style={{ borderRadius: "14px", overflow: "hidden", marginBottom: "20px" }}>
                                    <img src={selectedIssue.imageURL} alt={selectedIssue.title} style={{ width: "100%", height: "220px", objectFit: "cover" }} />
                                </div>
                            )}
                            <p style={{ color: "rgba(203,213,225,.75)", fontSize: "14px", lineHeight: 1.7, marginBottom: "20px" }}>{selectedIssue.description}</p>

                            {/* Timeline grid */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                                {[
                                    { l: "Reported On", v: new Date(selectedIssue.createdAt).toLocaleString() },
                                    { l: "Accepted On", v: selectedIssue.acceptedAt ? new Date(selectedIssue.acceptedAt).toLocaleString() : "—" },
                                    { l: "Resolved On", v: selectedIssue.resolvedAt ? new Date(selectedIssue.resolvedAt).toLocaleString() : "—" },
                                    { l: "Officer",     v: selectedIssue.assignedOfficer?.name || "Not assigned" },
                                ].map(row => (
                                    <div key={row.l} style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)", borderRadius: "12px", padding: "14px 16px" }}>
                                        <p style={{ fontSize: "11px", fontWeight: "600", color: "rgba(148,163,184,.6)", textTransform: "uppercase", letterSpacing: ".4px", marginBottom: "4px" }}>{row.l}</p>
                                        <p style={{ fontSize: "13px", fontWeight: "600", color: "rgba(203,213,225,.85)" }}>{row.v}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Tracking details */}
                            <div style={{ background: "rgba(139,92,246,.08)", border: "1px solid rgba(139,92,246,.2)", borderRadius: "14px", padding: "16px 18px", marginBottom: "20px" }}>
                                <p style={{ fontSize: "13px", fontWeight: "700", color: "rgba(196,181,253,.9)", marginBottom: "12px" }}>📋 Tracking Details</p>
                                {[
                                    { l: "Category",   v: selectedIssue.category },
                                    { l: "Department", v: selectedIssue.department || "—" },
                                    { l: "Location",   v: selectedIssue.location?.address || "—" },
                                ].map(row => (
                                    <div key={row.l} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
                                        <span style={{ fontSize: "13px", color: "rgba(148,163,184,.65)", fontWeight: "500" }}>{row.l}</span>
                                        <span style={{ fontSize: "13px", color: "rgba(203,213,225,.85)", fontWeight: "600" }}>{row.v}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Feedback */}
                            {selectedIssue.status === "Resolved" && (
                                selectedIssue.feedback?.submitted ? (
                                    <div style={{ background: "rgba(16,185,129,.1)", border: "1px solid rgba(16,185,129,.25)", borderRadius: "14px", padding: "16px 18px" }}>
                                        <p style={{ color: "#34d399", fontWeight: "700", fontSize: "13px", marginBottom: "10px" }}>✅ Feedback Submitted</p>
                                        <div style={{ display: "flex", gap: "3px", marginBottom: "8px" }}>
                                            {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: "20px", color: s <= selectedIssue.feedback.rating ? "#fbbf24" : "rgba(255,255,255,.15)" }}>★</span>)}
                                        </div>
                                        {selectedIssue.feedback.comment && <p style={{ color: "rgba(203,213,225,.65)", fontSize: "13px", fontStyle: "italic" }}>"{selectedIssue.feedback.comment}"</p>}
                                    </div>
                                ) : (
                                    <FeedbackForm issue={selectedIssue} onSubmitted={(fb) => {
                                        setSelectedIssue(prev => ({ ...prev, feedback: { submitted: true, ...fb } }));
                                        setIssues(prev => prev.map(i => i._id === selectedIssue._id ? { ...i, feedback: { submitted: true, ...fb } } : i));
                                    }} />
                                )
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AllMyIssues;
