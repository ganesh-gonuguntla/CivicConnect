import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getAssignedIssues, updateIssueStatus } from "../services/api";
import { useAuth } from "../context/AuthContext";

/* ── status config ───────────────────────────────────────────── */
const STATUS_CONFIG = {
    Pending: { color: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-500" },
    "In Progress": { color: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500" },
    Resolved: { color: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
};

/* ── tiny toast ──────────────────────────────────────────────── */
function Toast({ msg, type, onClose }) {
    useEffect(() => {
        const t = setTimeout(onClose, 3000);
        return () => clearTimeout(t);
    }, [onClose]);
    return (
        <div className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-xl shadow-xl text-white text-sm font-semibold flex items-center gap-3 ${type === "success" ? "bg-emerald-600" : "bg-red-600"
            }`} style={{ animation: "slideUp 0.3s ease" }}>
            {type === "success" ? "✅" : "❌"} {msg}
            <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100 text-lg">×</button>
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
        <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">📍</span>
            {mapsUrl ? (
                <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline underline-offset-2 hover:text-blue-800 font-medium truncate"
                >
                    {address || label}
                    {hasCoords && address && (
                        <span className="ml-1 text-xs text-slate-400 font-normal">({label})</span>
                    )}
                </a>
            ) : (
                <span className="text-slate-600">{label}</span>
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

    /* ══ render ══════════════════════════════════════════════ */
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white px-8 py-8 shadow-lg">
                <h1 className="text-4xl font-bold mb-2">👮 Officer Dashboard</h1>
                <p className="text-blue-200 text-lg">
                    {user?.department} Department • {user?.name}
                </p>
            </div>

            {/* Stat Cards */}
            <div className="px-8 py-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: "Total Assigned", val: counts.all, color: "from-blue-500 to-blue-600", icon: "📊" },
                        { label: "Pending", val: counts.Pending, color: "from-red-500 to-red-600", icon: "⏳" },
                        { label: "In Progress", val: counts["In Progress"], color: "from-amber-500 to-amber-600", icon: "🔄" },
                        { label: "Resolved", val: counts.Resolved, color: "from-emerald-500 to-emerald-600", icon: "✅" },
                    ].map((s) => (
                        <div key={s.label} className={`bg-gradient-to-br ${s.color} text-white rounded-xl shadow-lg p-6`}>
                            <div className="text-3xl mb-2">{s.icon}</div>
                            <p className="text-sm opacity-90 font-medium">{s.label}</p>
                            <p className="text-4xl font-bold mt-2">{s.val}</p>
                        </div>
                    ))}
                </div>

                {/* Filter tabs */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {["all", "Pending", "In Progress", "Resolved"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${filter === f
                                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                                    : "bg-white text-slate-600 border-2 border-slate-200 hover:border-blue-400 hover:text-blue-600"
                                }`}
                        >
                            {f === "all" ? `All (${counts.all})` : `${f} (${counts[f]})`}
                        </button>
                    ))}
                </div>

                {/* Loading skeleton */}
                {fetching && (
                    <div className="grid md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map((n) => (
                            <div key={n} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                                <div className="h-5 bg-slate-200 rounded w-3/4 mb-4" />
                                <div className="h-3 bg-slate-100 rounded w-full mb-3" />
                                <div className="h-40 bg-slate-100 rounded-lg mb-4" />
                                <div className="h-3 bg-slate-100 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {!fetching && filteredIssues.length === 0 && (
                    <div className="bg-white rounded-xl shadow-sm py-20 text-center border-2 border-dashed border-slate-200">
                        <p className="text-6xl mb-4">📋</p>
                        <p className="text-xl font-bold text-slate-900">No issues found</p>
                        <p className="text-slate-500 mt-2">
                            {filter === "all"
                                ? "No issues assigned to your department yet."
                                : `No ${filter.toLowerCase()} issues right now.`}
                        </p>
                    </div>
                )}

                {/* Issue cards */}
                {!fetching && filteredIssues.length > 0 && (
                    <div className="grid md:grid-cols-2 gap-6">
                        {filteredIssues.map((issue) => {
                            const cfg = STATUS_CONFIG[issue.status] || STATUS_CONFIG.Pending;
                            return (
                                <div
                                    key={issue._id}
                                    className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-slate-200 flex flex-col gap-4 p-6"
                                >
                                    {/* Top: title + status badge */}
                                    <div className="flex items-start justify-between gap-3">
                                        <h4 className="text-lg font-bold text-slate-900 leading-snug flex-1">
                                            {issue.title}
                                        </h4>
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap shrink-0 ${cfg.color}`}>
                                            <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                                            {issue.status}
                                        </span>
                                    </div>

                                    {/* Description */}
                                    <p className="text-slate-600 leading-relaxed line-clamp-3">{issue.description}</p>

                                    {/* ── Photo ── */}
                                    {issue.imageURL && (
                                        <div
                                            className="cursor-pointer group"
                                            onClick={() => setExpandedImage(issue.imageURL)}
                                            title="Click to enlarge"
                                        >
                                            <img
                                                src={issue.imageURL}
                                                alt="Issue photo"
                                                className="w-full h-48 object-cover rounded-lg border border-slate-200 group-hover:opacity-90 transition-opacity"
                                            />
                                            <p className="text-xs text-slate-500 mt-2 text-center">🔍 Click to enlarge</p>
                                        </div>
                                    )}

                                    {/* ── Location ── */}
                                    <LocationBadge location={issue.location} />

                                    {/* Meta info */}
                                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
                                        <span>📂 {issue.category}</span>
                                        <span>🏢 {issue.department}</span>
                                        {issue.createdBy?.name && (
                                            <span>👤 {issue.createdBy.name}</span>
                                        )}
                                        <span>📅 {new Date(issue.createdAt).toLocaleDateString("en-IN", {
                                            day: "numeric", month: "short", year: "numeric"
                                        })}</span>
                                    </div>

                                    {/* ── Past comments ── */}
                                    {issue.comments && issue.comments.length > 0 && (
                                        <div className="bg-slate-50 rounded-lg p-4 space-y-3 border border-slate-200">
                                            <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                                                📝 Progress Notes
                                            </p>
                                            {issue.comments.map((c, i) => (
                                                <div key={i} className="text-xs text-slate-600 border-l-3 border-blue-400 pl-3">
                                                    <span className="font-semibold text-blue-600">
                                                        {c.by?.name || "Officer"}
                                                    </span>
                                                    <span className="text-slate-400"> · {new Date(c.at).toLocaleString("en-IN", {
                                                        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                                                    })}</span>
                                                    <p className="mt-1">{c.text}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Comment input */}
                                    <textarea
                                        placeholder="Add a progress note (optional)…"
                                        value={comment[issue._id] || ""}
                                        onChange={(e) =>
                                            setComment({ ...comment, [issue._id]: e.target.value })
                                        }
                                        rows={2}
                                        className="w-full border-2 border-slate-200 bg-slate-50 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                                    />

                                    {/* Action buttons */}
                                    <div className="flex gap-3 pt-2">
                                        <ActionBtn
                                            label="⏳ In Progress"
                                            disabled={issue.status === "In Progress"}
                                            loading={actionLoading === `${issue._id}-In Progress`}
                                            color="amber"
                                            onClick={() => handleStatusChange(issue._id, "In Progress")}
                                        />
                                        <ActionBtn
                                            label="✅ Resolve"
                                            disabled={issue.status === "Resolved"}
                                            loading={actionLoading === `${issue._id}-Resolved`}
                                            color="emerald"
                                            onClick={() => handleStatusChange(issue._id, "Resolved")}
                                        />
                                    </div>

                                    {/* Chat with citizen */}
                                    <button
                                        onClick={() => navigate(`/chat/${issue._id}`)}
                                        className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-bold hover:from-blue-700 hover:to-cyan-700 transition flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        💬 Chat with Citizen
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Lightbox ── */}
            {expandedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                    onClick={() => setExpandedImage(null)}
                >
                    <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setExpandedImage(null)}
                            className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white text-gray-800 font-bold flex items-center justify-center shadow-lg text-sm hover:bg-gray-100"
                        >
                            ×
                        </button>
                        <img
                            src={expandedImage}
                            alt="Enlarged"
                            className="w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
                        />
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}

/* ── small action button ─────────────────────────────────────── */
function ActionBtn({ label, disabled, loading, color, onClick }) {
    const colors = {
        amber: "bg-amber-500 hover:bg-amber-600 disabled:bg-amber-200",
        emerald: "bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-200",
    };
    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            className={`flex-1 py-2 rounded-lg text-white text-sm font-bold transition-colors flex items-center justify-center gap-2 ${colors[color]}`}
        >
            {loading ? (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
            ) : label}
        </button>
    );
}

export default OfficerDashboard;
