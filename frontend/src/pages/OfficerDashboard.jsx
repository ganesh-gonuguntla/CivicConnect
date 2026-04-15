import { useEffect, useState, useCallback } from "react";
import { getAssignedIssues, updateIssueStatus } from "../services/api";
import { useAuth } from "../context/AuthContext";

/* ── status config ───────────────────────────────────────────── */
const STATUS_CONFIG = {
    Pending: { color: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-500" },
    "In Progress": { color: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500" },
    Resolved: { color: "bg-green-100 text-green-700 border-green-200", dot: "bg-green-500" },
};

/* ── tiny toast ──────────────────────────────────────────────── */
function Toast({ msg, type, onClose }) {
    useEffect(() => {
        const t = setTimeout(onClose, 3000);
        return () => clearTimeout(t);
    }, [onClose]);
    return (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-semibold flex items-center gap-2 ${type === "success" ? "bg-green-600" : "bg-red-600"
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
<<<<<<< HEAD
        <div className="p-6">
            <h2 className="text-3xl font-bold text-purple-800 mb-4">
                Officer Dashboard
            </h2>

            {issues.length === 0 ? (
                <p className="text-gray-600">No issues assigned yet.</p>
            ) : (
                <div className="grid md:grid-cols-2 gap-4">
                    {issues.map((issue) => (
                        <div
                            key={issue._id}
                            className="bg-purple-50 p-4 shadow rounded-lg border border-gray-200"
                        >
                            <h4 className="text-lg font-semibold text-purple-800">
                                {issue.title}
                            </h4>
                            <p className="text-gray-700">{issue.description}</p>
                            {issue.imageURL && (
                                <img
                                    src={issue.imageURL}
                                    alt={issue.title}
                                    className="w-full h-48 object-cover mt-2 rounded"
                                />
                            )}
                            <p className="text-sm text-gray-500 mt-1">
                                Category: {issue.category} | Department: {issue.department}
                            </p>
                            {issue.location && (issue.location.lat || issue.location.lng) && (
                                <p className="text-sm text-gray-600 mt-1">
                                    📍 Location: {issue.location.address || `${issue.location.lat}, ${issue.location.lng}`}
                                </p>
                            )}
                            <p className="text-sm text-gray-600">
                                Status:{" "}
                                <span
                                    className={`font-semibold ${issue.status === "Resolved"
                                        ? "text-green-600"
                                        : issue.status === "In Progress"
                                            ? "text-yellow-600"
                                            : "text-red-600"
                                        }`}
                                >
                                    {issue.status}
                                </span>
                            </p>

                            {/* Comment input */}
                            <textarea
                                placeholder="Add progress comment"
                                value={comment[issue._id] || ""}
                                onChange={(e) =>
                                    setComment({ ...comment, [issue._id]: e.target.value })
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-2 text-sm"
                            />

                            {/* Status buttons */}
                            <div className="flex gap-2 mt-3">
                                <button
                                    onClick={() => handleStatusChange(issue._id, "In Progress")}
                                    disabled={loading}
                                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                                >
                                    In Progress
                                </button>
                                <button
                                    onClick={() => handleStatusChange(issue._id, "Resolved")}
                                    disabled={loading}
                                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                                >
                                    Resolve
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
=======
        <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">📍</span>
            {mapsUrl ? (
                <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline underline-offset-2 hover:text-blue-800 font-medium truncate"
                >
                    {address || label}
                    {hasCoords && address && (
                        <span className="ml-1 text-xs text-gray-400 font-normal">({label})</span>
                    )}
                </a>
            ) : (
                <span className="text-gray-600">{label}</span>
>>>>>>> a5355e05bb98d623a8c4f8a86aadf81c47108b0a
            )}
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════
   OFFICER DASHBOARD
══════════════════════════════════════════════════════════════ */
function OfficerDashboard() {
    const { user } = useAuth();
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
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-700 to-blue-700 text-white px-8 py-6 shadow-lg">
                <h1 className="text-3xl font-bold">👮 Officer Dashboard</h1>
                <p className="text-blue-200 text-sm mt-1">
                    {user?.department} Department · {user?.name}
                </p>
            </div>

            {/* Stat strip */}
            <div className="bg-white border-b border-gray-200 px-8 py-4 flex flex-wrap gap-6">
                {[
                    { label: "Total Assigned", val: counts.all, color: "text-blue-600" },
                    { label: "Pending", val: counts.Pending, color: "text-red-600" },
                    { label: "In Progress", val: counts["In Progress"], color: "text-amber-600" },
                    { label: "Resolved", val: counts.Resolved, color: "text-green-600" },
                ].map((s) => (
                    <div key={s.label} className="text-center">
                        <p className={`text-2xl font-extrabold ${s.color}`}>{s.val}</p>
                        <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                    </div>
                ))}
            </div>

            <div className="px-8 py-6 max-w-7xl mx-auto">
                {/* Filter tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {["all", "Pending", "In Progress", "Resolved"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${filter === f
                                    ? "bg-blue-600 text-white shadow"
                                    : "bg-white text-gray-600 border border-gray-200 hover:border-blue-400"
                                }`}
                        >
                            {f === "all" ? `All (${counts.all})` : `${f} (${counts[f]})`}
                        </button>
                    ))}
                </div>

                {/* Loading skeleton */}
                {fetching && (
                    <div className="grid md:grid-cols-2 gap-5">
                        {[1, 2, 3, 4].map((n) => (
                            <div key={n} className="bg-white rounded-2xl shadow p-5 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                                <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                                <div className="h-32 bg-gray-100 rounded-xl mb-3" />
                                <div className="h-3 bg-gray-100 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {!fetching && filteredIssues.length === 0 && (
                    <div className="bg-white rounded-2xl shadow py-20 text-center">
                        <p className="text-5xl mb-3">📋</p>
                        <p className="text-lg font-semibold text-gray-700">No issues found</p>
                        <p className="text-sm text-gray-400 mt-1">
                            {filter === "all"
                                ? "No issues assigned to your department yet."
                                : `No ${filter} issues right now.`}
                        </p>
                    </div>
                )}

                {/* Issue cards */}
                {!fetching && filteredIssues.length > 0 && (
                    <div className="grid md:grid-cols-2 gap-5">
                        {filteredIssues.map((issue) => {
                            const cfg = STATUS_CONFIG[issue.status] || STATUS_CONFIG.Pending;
                            return (
                                <div
                                    key={issue._id}
                                    className="bg-white rounded-2xl shadow p-5 flex flex-col gap-4 border border-gray-100 hover:shadow-md transition-shadow"
                                >
                                    {/* Top: title + status badge */}
                                    <div className="flex items-start justify-between gap-3">
                                        <h4 className="text-base font-bold text-gray-800 leading-snug">
                                            {issue.title}
                                        </h4>
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap shrink-0 ${cfg.color}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                            {issue.status}
                                        </span>
                                    </div>

                                    {/* Description */}
                                    <p className="text-sm text-gray-600 leading-relaxed">{issue.description}</p>

                                    {/* ── Photo ── */}
                                    {issue.imageURL && (
                                        <div
                                            className="cursor-zoom-in"
                                            onClick={() => setExpandedImage(issue.imageURL)}
                                            title="Click to enlarge"
                                        >
                                            <img
                                                src={issue.imageURL}
                                                alt="Issue photo"
                                                className="w-full h-48 object-cover rounded-xl border border-gray-200 hover:opacity-90 transition-opacity"
                                            />
                                            <p className="text-xs text-gray-400 mt-1 text-right">🔍 Click to enlarge</p>
                                        </div>
                                    )}

                                    {/* ── Location ── */}
                                    <LocationBadge location={issue.location} />

                                    {/* Meta info */}
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                                        <span>📂 {issue.category}</span>
                                        <span>🏢 {issue.department}</span>
                                        {issue.createdBy?.name && (
                                            <span>👤 {issue.createdBy.name}</span>
                                        )}
                                        <span>🗓️ {new Date(issue.createdAt).toLocaleDateString("en-IN", {
                                            day: "numeric", month: "short", year: "numeric"
                                        })}</span>
                                    </div>

                                    {/* ── Past comments ── */}
                                    {issue.comments && issue.comments.length > 0 && (
                                        <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                                Progress Notes
                                            </p>
                                            {issue.comments.map((c, i) => (
                                                <div key={i} className="text-xs text-gray-600 border-l-2 border-blue-300 pl-2">
                                                    <span className="font-medium text-blue-700">
                                                        {c.by?.name || "Officer"}
                                                    </span>
                                                    {" · "}
                                                    {new Date(c.at).toLocaleString("en-IN", {
                                                        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                                                    })}
                                                    <p className="mt-0.5">{c.text}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Comment input */}
                                    <textarea
                                        placeholder="Add a progress note (optional)..."
                                        value={comment[issue._id] || ""}
                                        onChange={(e) =>
                                            setComment({ ...comment, [issue._id]: e.target.value })
                                        }
                                        rows={2}
                                        className="w-full border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                                    />

                                    {/* Action buttons */}
                                    <div className="flex gap-2">
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
                                            color="green"
                                            onClick={() => handleStatusChange(issue._id, "Resolved")}
                                        />
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
        green: "bg-green-600 hover:bg-green-700 disabled:bg-green-200",
    };
    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            className={`flex-1 py-2 rounded-xl text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 ${colors[color]}`}
        >
            {loading ? (
                <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
            ) : label}
        </button>
    );
}

export default OfficerDashboard;
