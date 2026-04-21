import { useEffect, useState, useCallback } from "react";
import { getAllIssues, getPendingOfficers, updateOfficerStatus, deleteIssue } from "../services/api";
import { PieChart, Pie, Cell, Legend, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

const COLORS = ["#60a5fa", "#fbbf24", "#34d399", "#f87171"];

/* ── tiny toast component ──────────────────────────────────────── */
function Toast({ msg, type, onClose }) {
    useEffect(() => {
        const t = setTimeout(onClose, 3500);
        return () => clearTimeout(t);
    }, [onClose]);

    const bg =
        type === "success"
            ? "bg-green-600"
            : type === "error"
                ? "bg-red-600"
                : "bg-blue-600";

    return (
        <div
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-medium animate-slide-up ${bg}`}
        >
            <span>{type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"}</span>
            <span>{msg}</span>
            <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100 text-lg leading-none">
                ×
            </button>
        </div>
    );
}

/* ── department color map ───────────────────────────────────────── */
const deptColor = {
    Roads: "bg-blue-100 text-blue-700",
    Water: "bg-cyan-100 text-cyan-700",
    Sanitation: "bg-purple-100 text-purple-700",
    Electricity: "bg-yellow-100 text-yellow-700",
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

    /* ══ render ══════════════════════════════════════════════════ */
    return (
        <div className="min-h-screen bg-slate-50">
            {/* ── Header ── */}
            <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white px-8 py-8 shadow-lg">
                <h1 className="text-4xl font-bold tracking-tight mb-2">⚙️ Admin Dashboard</h1>
                <p className="text-blue-200">
                    CivicConnect · Manage all issues & officer accounts
                </p>
            </div>

            {/* ── Tabs ── */}
            <div className="bg-white border-b border-slate-200 px-8">
                <nav className="flex gap-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative flex items-center gap-2 px-5 py-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === tab.id
                                    ? "border-blue-600 text-blue-600"
                                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                                }`}
                        >
                            {tab.label}
                            {tab.badge && (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold">
                                    {tab.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="px-8 py-8 max-w-7xl mx-auto">
                {/* ════════════════════════════════
                    TAB: OVERVIEW
                ════════════════════════════════ */}
                {activeTab === "overview" && (
                    <div className="space-y-8">
                        {/* Stat cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg rounded-xl p-6 border-l-4 border-blue-700 text-white">
                                <h3 className="text-blue-100 text-sm font-semibold uppercase tracking-wide">Total Issues</h3>
                                <p className="text-5xl font-bold mt-3">{stats.total}</p>
                            </div>
                            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg rounded-xl p-6 border-l-4 border-emerald-700 text-white">
                                <h3 className="text-emerald-100 text-sm font-semibold uppercase tracking-wide">Resolved</h3>
                                <p className="text-5xl font-bold mt-3">{stats.resolved}</p>
                            </div>
                            <div className="bg-gradient-to-br from-red-500 to-red-600 shadow-lg rounded-xl p-6 border-l-4 border-red-700 text-white">
                                <h3 className="text-red-100 text-sm font-semibold uppercase tracking-wide">Pending</h3>
                                <p className="text-5xl font-bold mt-3">{stats.pending}</p>
                            </div>
                        </div>

                        {/* Charts */}
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center">
                                <h3 className="text-lg font-bold mb-6 text-slate-900 self-start">📊 Issue Categories</h3>
                                <PieChart width={320} height={300}>
                                    <Pie
                                        data={byCategory}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        label
                                    >
                                        {byCategory.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Legend />
                                </PieChart>
                            </div>

                            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center">
                                <h3 className="text-lg font-bold mb-6 text-slate-900 self-start">📈 Resolved vs Pending</h3>
                                <BarChart width={320} height={300} data={[stats]}>
                                    <XAxis dataKey="total" hide />
                                    <YAxis hide />
                                    <Tooltip />
                                    <Bar dataKey="resolved" fill="#10b981" radius={[4, 4, 0, 0]} name="Resolved" />
                                    <Bar dataKey="pending" fill="#ef4444" radius={[4, 4, 0, 0]} name="Pending" />
                                </BarChart>
                            </div>
                        </div>
                    </div>
                )}

                {/* ════════════════════════════════
                    TAB: ALL ISSUES
                ════════════════════════════════ */}
                {activeTab === "issues" && (
                    <div>
                        <h3 className="text-2xl font-bold mb-6 text-slate-900">📋 All Reported Issues</h3>
                        <div className="overflow-x-auto shadow-sm border border-slate-200 rounded-xl bg-white">
                            <table className="min-w-full text-left text-sm">
                                <thead className="bg-slate-100 text-slate-900">
                                    <tr>
                                        <th className="py-4 px-5 font-bold border-b border-slate-200">Title</th>
                                        <th className="py-4 px-5 font-bold border-b border-slate-200">Category</th>
                                        <th className="py-4 px-5 font-bold border-b border-slate-200">Status</th>
                                        <th className="py-4 px-5 font-bold border-b border-slate-200">Department</th>
                                        <th className="py-4 px-5 font-bold border-b border-slate-200">Created By</th>
                                        <th className="py-4 px-5 font-bold border-b border-slate-200">Feedback</th>
                                        <th className="py-4 px-5 font-bold border-b border-slate-200">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {issues.length === 0 && (
                                        <tr>
                                            <td colSpan="7" className="py-8 text-center text-slate-400 italic">No issues found.</td>
                                        </tr>
                                    )}
                                    {issues.map((i) => (
                                        <tr key={i._id} className="border-b border-slate-200 transition hover:bg-slate-50">
                                            <td className="py-4 px-5 text-slate-900 font-semibold">{i.title}</td>
                                            <td className="py-4 px-5">
                                                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold">
                                                    {i.category}
                                                </span>
                                            </td>
                                            <td className="py-4 px-5">
                                                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                                                    i.status === "Resolved" ? "bg-emerald-100 text-emerald-700" :
                                                    i.status === "Pending" ? "bg-red-100 text-red-700" :
                                                    "bg-amber-100 text-amber-700"
                                                }`}>
                                                    {i.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-5 text-slate-600">{i.department}</td>
                                            <td className="py-4 px-5 text-slate-600">
                                                {i.createdBy?.name || "—"}
                                            </td>
                                            <td className="py-4 px-5">
                                                {i.feedback?.submitted ? (
                                                    <div>
                                                        <div className="flex gap-0.5">
                                                            {[1,2,3,4,5].map(s => (
                                                                <span key={s} className={`text-lg ${ s <= i.feedback.rating ? "text-amber-400" : "text-slate-300"}`}>★</span>
                                                            ))}
                                                        </div>
                                                        {i.feedback.comment && (
                                                            <p className="text-xs text-slate-500 mt-1 max-w-[160px] truncate" title={i.feedback.comment}>
                                                                {i.feedback.comment}
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-300 text-xs">—</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-5">
                                                <button
                                                    onClick={() => setConfirmModal({ id: i._id, title: i.title })}
                                                    disabled={deleteLoading === i._id}
                                                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100 hover:border-red-400 transition disabled:opacity-40"
                                                >
                                                    {deleteLoading === i._id ? (
                                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                                        </svg>
                                                    ) : (
                                                        "🗑️ Delete"
                                                    )}
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
                        <h3 className="text-2xl font-semibold mb-4 text-purple-900 border-b pb-2">Pending Officer Approvals</h3>

                        {pendingOfficers.length === 0 ? (
                            <div className="bg-green-50 text-green-700 p-8 rounded-xl border border-green-200 text-center text-lg font-medium shadow-sm">
                                🎉 Awesome! All officers have been reviewed. There are no pending approvals.
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-6">
                                {pendingOfficers.map((o) => (
                                    <div key={o._id} className="bg-white border rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
                                        <div className="p-6 border-b border-gray-100 flex-1">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-11 h-11 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-lg font-bold">
                                                        {o.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xl font-bold text-gray-800">{o.name}</h4>
                                                        <p className="text-gray-500 text-sm mt-1">{o.email}</p>
                                                    </div>
                                                </div>
                                                <span className="bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                                    Pending
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-500 uppercase">Department</p>
                                                <p className="text-lg font-medium text-purple-700">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-sm font-semibold ${deptColor[o.department] || "bg-gray-100 text-gray-600"}`}>
                                                        {o.department || "General"}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-b-xl flex gap-3 justify-end items-center">
                                            <button
                                                onClick={() => handleOfficerStatus(o._id, "rejected")}
                                                disabled={actionLoading === o._id}
                                                className="px-5 py-2 border border-red-300 text-red-600 font-medium rounded-lg hover:bg-red-50 hover:text-red-700 transition disabled:opacity-50"
                                            >
                                                Reject Request
                                            </button>
                                            <button
                                                onClick={() => handleOfficerStatus(o._id, "approved")}
                                                disabled={actionLoading === o._id}
                                                className="px-5 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-700 shadow-md transition disabled:opacity-50"
                                            >
                                                {actionLoading === o._id ? "Processing…" : "Approve Officer"}
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

            {/* Animations */}
            <style>{`
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-up { animation: slide-up 0.3s ease both; }
            `}</style>
        </div>
    );
}

/* ── Confirmation Modal ─────────────────────────────────────────── */
function ConfirmModal({ title, onConfirm, onCancel }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-slide-up">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">⚠️</span>
                    <h3 className="text-xl font-bold text-gray-800">Delete Request?</h3>
                </div>
                <p className="text-gray-600 mb-1">
                    Are you sure you want to delete this request?
                </p>
                <p className="text-sm text-gray-400 bg-gray-50 rounded-lg px-3 py-2 mb-6 truncate">
                    &ldquo;{title}&rdquo;
                </p>
                <p className="text-xs text-red-500 mb-6">⚠️ This action cannot be undone.</p>
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-5 py-2 rounded-xl border border-gray-300 text-gray-600 font-medium hover:bg-gray-100 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-5 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 shadow transition"
                    >
                        Yes, Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
