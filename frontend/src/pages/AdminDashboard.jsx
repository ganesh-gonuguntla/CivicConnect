import { useEffect, useState, useCallback } from "react";
import {
    getAllIssues,
    getOfficers,
    verifyOfficer,
    unverifyOfficer,
} from "../services/api";
import {
    PieChart,
    Pie,
    Cell,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
} from "recharts";

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

/* ── verification badge ─────────────────────────────────────────── */
function Badge({ verified }) {
    return verified ? (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
            ✓ Verified
        </span>
    ) : (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
            ⏳ Pending
        </span>
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
    const [activeTab, setActiveTab] = useState("overview"); // "overview" | "officers"
    const [issues, setIssues] = useState([]);
    const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0 });
    const [byCategory, setByCategory] = useState([]);

    const [officers, setOfficers] = useState([]);
    const [officerFilter, setOfficerFilter] = useState("all"); // "all" | "verified" | "pending"
    const [actionLoading, setActionLoading] = useState(null); // officer id being actioned

    const [toast, setToast] = useState(null); // { msg, type }

    /* ── data fetching ── */
    const fetchIssues = useCallback(async () => {
        try {
            const res = await getAllIssues();
            setIssues(res.data);
            const resolved = res.data.filter((i) => i.status === "Resolved").length;
            const pending = res.data.filter((i) => i.status !== "Resolved").length;
            const categoryCounts = {};
            res.data.forEach((i) => {
                categoryCounts[i.category] = (categoryCounts[i.category] || 0) + 1;
            });
            setStats({ total: res.data.length, resolved, pending });
            setByCategory(
                Object.entries(categoryCounts).map(([name, value]) => ({ name, value }))
            );
        } catch {
            showToast("Failed to load issues", "error");
        }
    }, []);

    const fetchOfficers = useCallback(async () => {
        try {
            const res = await getOfficers();
            setOfficers(res.data);
        } catch {
            showToast("Failed to load officers", "error");
        }
    }, []);

    useEffect(() => {
        fetchIssues();
        fetchOfficers();
    }, [fetchIssues, fetchOfficers]);

    /* ── helpers ── */
    const showToast = (msg, type = "success") => setToast({ msg, type });

    const handleVerify = async (officer) => {
        setActionLoading(officer._id);
        try {
            if (officer.verified) {
                await unverifyOfficer(officer._id);
                showToast(`${officer.name}'s verification revoked`, "error");
            } else {
                await verifyOfficer(officer._id);
                showToast(`${officer.name} verified successfully! ✓`, "success");
            }
            await fetchOfficers();
        } catch (err) {
            showToast(err.response?.data?.msg || "Action failed", "error");
        } finally {
            setActionLoading(null);
        }
    };

    /* ── derived data ── */
    const filteredOfficers = officers.filter((o) => {
        if (officerFilter === "verified") return o.verified;
        if (officerFilter === "pending") return !o.verified;
        return true;
    });

    const pendingCount = officers.filter((o) => !o.verified).length;
    const verifiedCount = officers.filter((o) => o.verified).length;

    /* ── tab config ── */
    const tabs = [
        { id: "overview", label: "📊 Overview" },
        {
            id: "officers",
            label: "👮 Officers",
            badge: pendingCount > 0 ? pendingCount : null,
        },
    ];

    /* ══ render ══════════════════════════════════════════════════ */
    return (
        <div className="min-h-screen bg-gray-50">
            {/* ── Header ── */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white px-8 py-6 shadow-lg">
                <h1 className="text-3xl font-bold tracking-tight">⚙️ Admin Dashboard</h1>
                <p className="text-blue-200 text-sm mt-1">
                    CivicConnect · Manage issues &amp; officer accounts
                </p>
            </div>

            {/* ── Tabs ── */}
            <div className="bg-white border-b border-gray-200 px-8">
                <nav className="flex gap-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative flex items-center gap-2 px-5 py-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === tab.id
                                    ? "border-blue-600 text-blue-700"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                        >
                            {tab.label}
                            {tab.badge && (
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-xs font-bold">
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
                    <div>
                        {/* Stat cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                            <StatCard label="Total Issues" value={stats.total} color="blue" icon="📋" />
                            <StatCard label="Resolved" value={stats.resolved} color="green" icon="✅" />
                            <StatCard label="Pending" value={stats.pending} color="red" icon="⏳" />
                        </div>

                        {/* Charts */}
                        <div className="grid md:grid-cols-2 gap-8 mb-10">
                            <div className="bg-white rounded-2xl shadow p-6">
                                <h3 className="text-base font-semibold text-gray-700 mb-4">
                                    Issue Categories
                                </h3>
                                <PieChart width={300} height={280}>
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

                            <div className="bg-white rounded-2xl shadow p-6">
                                <h3 className="text-base font-semibold text-gray-700 mb-4">
                                    Resolved vs Pending
                                </h3>
                                <BarChart width={300} height={280} data={[stats]}>
                                    <XAxis dataKey="total" hide />
                                    <YAxis hide />
                                    <Tooltip />
                                    <Bar dataKey="resolved" fill="#34d399" radius={[6, 6, 0, 0]} name="Resolved" />
                                    <Bar dataKey="pending" fill="#f87171" radius={[6, 6, 0, 0]} name="Pending" />
                                </BarChart>
                            </div>
                        </div>

                        {/* All Issues table */}
                        <div className="bg-white rounded-2xl shadow">
                            <div className="px-6 py-4 border-b border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    All Reported Issues
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                                        <tr>
                                            <th className="py-3 px-5 text-left font-medium">Title</th>
                                            <th className="py-3 px-5 text-left font-medium">Category</th>
                                            <th className="py-3 px-5 text-left font-medium">Status</th>
                                            <th className="py-3 px-5 text-left font-medium">Department</th>
                                            <th className="py-3 px-5 text-left font-medium">Reported By</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {issues.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="py-10 text-center text-gray-400">
                                                    No issues found.
                                                </td>
                                            </tr>
                                        ) : (
                                            issues.map((i) => (
                                                <tr key={i._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="py-3 px-5 font-medium text-gray-800">{i.title}</td>
                                                    <td className="py-3 px-5 text-gray-600">{i.category}</td>
                                                    <td className="py-3 px-5">
                                                        <StatusBadge status={i.status} />
                                                    </td>
                                                    <td className="py-3 px-5 text-gray-600">{i.department}</td>
                                                    <td className="py-3 px-5 text-gray-600">
                                                        {i.createdBy?.name || "—"}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ════════════════════════════════
                    TAB: OFFICERS
                ════════════════════════════════ */}
                {activeTab === "officers" && (
                    <div>
                        {/* Summary cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                            <StatCard label="Total Officers" value={officers.length} color="blue" icon="👮" />
                            <StatCard label="Verified" value={verifiedCount} color="green" icon="✅" />
                            <StatCard
                                label="Awaiting Approval"
                                value={pendingCount}
                                color="amber"
                                icon="⏳"
                                pulse={pendingCount > 0}
                            />
                        </div>

                        {/* Filter tabs */}
                        <div className="flex gap-2 mb-6">
                            {[
                                { key: "all", label: `All (${officers.length})` },
                                { key: "pending", label: `⏳ Pending (${pendingCount})` },
                                { key: "verified", label: `✅ Verified (${verifiedCount})` },
                            ].map((f) => (
                                <button
                                    key={f.key}
                                    onClick={() => setOfficerFilter(f.key)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${officerFilter === f.key
                                            ? "bg-blue-600 text-white shadow"
                                            : "bg-white text-gray-600 border border-gray-200 hover:border-blue-400"
                                        }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        {/* Officers grid */}
                        {filteredOfficers.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow py-20 text-center text-gray-400">
                                <p className="text-5xl mb-3">👮</p>
                                <p className="text-lg font-medium">No officers found</p>
                                <p className="text-sm mt-1">
                                    {officerFilter === "pending"
                                        ? "All officers are verified!"
                                        : "No officers registered yet."}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {filteredOfficers.map((officer) => (
                                    <OfficerCard
                                        key={officer._id}
                                        officer={officer}
                                        loading={actionLoading === officer._id}
                                        onAction={() => handleVerify(officer)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Toast */}
            {toast && (
                <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />
            )}

            {/* Slide-up animation */}
            <style>{`
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-up { animation: slide-up 0.3s ease both; }
                @keyframes pulse-ring {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(245,158,11,0.4); }
                    50%       { box-shadow: 0 0 0 8px rgba(245,158,11,0); }
                }
                .pulse-ring { animation: pulse-ring 1.8s ease-in-out infinite; }
            `}</style>
        </div>
    );
}

/* ── sub-components ────────────────────────────────────────────── */

function StatCard({ label, value, color, icon, pulse = false }) {
    const palette = {
        blue: { bg: "bg-blue-50", text: "text-blue-700", num: "text-blue-600" },
        green: { bg: "bg-green-50", text: "text-green-700", num: "text-green-600" },
        red: { bg: "bg-red-50", text: "text-red-700", num: "text-red-600" },
        amber: { bg: "bg-amber-50", text: "text-amber-700", num: "text-amber-600" },
    };
    const p = palette[color] || palette.blue;

    return (
        <div
            className={`${p.bg} rounded-2xl p-6 flex items-center gap-4 shadow-sm ${pulse ? "pulse-ring" : ""
                }`}
        >
            <span className="text-4xl">{icon}</span>
            <div>
                <p className={`text-sm font-medium ${p.text}`}>{label}</p>
                <p className={`text-3xl font-extrabold ${p.num}`}>{value}</p>
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    const map = {
        Resolved: "bg-green-100 text-green-700",
        "In Progress": "bg-blue-100 text-blue-700",
        Pending: "bg-amber-100 text-amber-700",
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] || "bg-gray-100 text-gray-600"}`}>
            {status}
        </span>
    );
}

function OfficerCard({ officer, loading, onAction }) {
    const deptClass =
        deptColor[officer.department] || "bg-gray-100 text-gray-600";

    return (
        <div
            className={`bg-white rounded-2xl shadow p-5 flex flex-col gap-4 border-2 transition-all ${officer.verified
                    ? "border-green-200 hover:border-green-400"
                    : "border-amber-200 hover:border-amber-400"
                }`}
        >
            {/* Top row */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center text-lg font-bold shadow-inner ${officer.verified ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                            }`}
                    >
                        {officer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800 leading-tight">{officer.name}</p>
                        <p className="text-xs text-gray-400 leading-tight">{officer.email}</p>
                    </div>
                </div>
                <Badge verified={officer.verified} />
            </div>

            {/* Department */}
            <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Department:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${deptClass}`}>
                    {officer.department || "—"}
                </span>
            </div>

            {/* Registered date */}
            <p className="text-xs text-gray-400">
                Registered:{" "}
                {new Date(officer.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                })}
            </p>

            {/* Action button */}
            <button
                onClick={onAction}
                disabled={loading}
                className={`w-full py-2 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${officer.verified
                        ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                        : "bg-blue-600 text-white hover:bg-blue-700 shadow"
                    }`}
            >
                {loading ? (
                    <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                ) : officer.verified ? (
                    "✕ Revoke Verification"
                ) : (
                    "✓ Approve Officer"
                )}
            </button>
        </div>
    );
}

export default AdminDashboard;
