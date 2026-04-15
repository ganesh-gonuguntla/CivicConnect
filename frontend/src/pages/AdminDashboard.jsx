<<<<<<< HEAD
import { useEffect, useState } from "react";
import { getAllIssues, getPendingOfficers, updateOfficerStatus } from "../services/api";
import { PieChart, Pie, Cell, Legend, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
=======
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
>>>>>>> a5355e05bb98d623a8c4f8a86aadf81c47108b0a

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
    const [pendingOfficers, setPendingOfficers] = useState([]);
    const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0 });
    const [byCategory, setByCategory] = useState([]);
    const [activeTab, setActiveTab] = useState("overview");

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
<<<<<<< HEAD
            setByCategory(catData);

            // Fetch pending officers
            const officersRes = await getPendingOfficers();
            setPendingOfficers(officersRes.data);
=======
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
>>>>>>> a5355e05bb98d623a8c4f8a86aadf81c47108b0a
        } catch (err) {
            showToast(err.response?.data?.msg || "Action failed", "error");
        } finally {
            setActionLoading(null);
        }
    };

<<<<<<< HEAD
    const handleOfficerStatus = async (id, status) => {
        try {
            await updateOfficerStatus(id, status);
            setPendingOfficers(pendingOfficers.filter((o) => o._id !== id));
            alert(`Officer ${status} successfully!`);
        } catch (err) {
            console.error("Error updating officer status", err);
            alert("Failed to update officer status");
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-purple-800 mb-6">Admin Dashboard</h2>

            {/* Tabs Navigation */}
            <div className="flex space-x-4 border-b border-gray-300 mb-6 pb-2">
                <button
                    onClick={() => setActiveTab("overview")}
                    className={`pb-2 px-4 transition duration-300 font-medium text-lg ${
                        activeTab === "overview"
                            ? "border-b-4 border-purple-600 text-purple-800"
                            : "text-gray-500 hover:text-purple-600"
                    }`}
                >
                    Overview
                </button>
                <button
                    onClick={() => setActiveTab("issues")}
                    className={`pb-2 px-4 transition duration-300 font-medium text-lg ${
                        activeTab === "issues"
                            ? "border-b-4 border-purple-600 text-purple-800"
                            : "text-gray-500 hover:text-purple-600"
                    }`}
                >
                    All Issues
                </button>
                <button
                    onClick={() => setActiveTab("approvals")}
                    className={`pb-2 px-4 transition duration-300 font-medium text-lg flex items-center gap-2 ${
                        activeTab === "approvals"
                            ? "border-b-4 border-purple-600 text-purple-800"
                            : "text-gray-500 hover:text-purple-600"
                    }`}
                >
                    Officer Approvals
                    {pendingOfficers.length > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {pendingOfficers.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Tab Contents */}
            {activeTab === "overview" && (
                <div className="space-y-8 animate-fadeIn">
                    {/* 🧮 Basic Stats */}
                    <div className="flex flex-wrap gap-4">
                        <div className="bg-white shadow p-6 rounded-xl flex-1 text-center border-l-4 border-purple-500">
                            <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Total Issues</h3>
                            <p className="text-4xl font-bold text-purple-700 mt-2">{stats.total}</p>
                        </div>
                        <div className="bg-white shadow p-6 rounded-xl flex-1 text-center border-l-4 border-green-500">
                            <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Resolved</h3>
                            <p className="text-4xl font-bold text-green-600 mt-2">{stats.resolved}</p>
                        </div>
                        <div className="bg-white shadow p-6 rounded-xl flex-1 text-center border-l-4 border-red-500">
                            <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Pending</h3>
                            <p className="text-4xl font-bold text-red-600 mt-2">{stats.pending}</p>
                        </div>
                    </div>

                    {/* 📊 Charts */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col items-center">
                            <h3 className="text-lg font-semibold mb-4 text-purple-900 self-start">Issue Categories</h3>
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

                        <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col items-center">
                            <h3 className="text-lg font-semibold mb-4 text-purple-900 self-start">Resolved vs Pending</h3>
                            <BarChart width={320} height={300} data={[stats]}>
                                <XAxis dataKey="total" hide />
                                <YAxis hide />
                                <Tooltip />
                                <Bar dataKey="resolved" fill="#34d399" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="pending" fill="#f87171" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "issues" && (
                <div className="animate-fadeIn">
                    <h3 className="text-2xl font-semibold mb-4 text-purple-900 border-b pb-2">All Reported Issues</h3>
                    <div className="overflow-x-auto shadow-sm border border-gray-200 rounded-xl rounded-t-lg">
                        <table className="min-w-full bg-white text-left text-sm">
                            <thead className="bg-purple-100 text-purple-800">
                                <tr>
                                    <th className="py-3 px-4 font-semibold border-b">Title</th>
                                    <th className="py-3 px-4 font-semibold border-b">Category</th>
                                    <th className="py-3 px-4 font-semibold border-b">Status</th>
                                    <th className="py-3 px-4 font-semibold border-b">Department</th>
                                    <th className="py-3 px-4 font-semibold border-b">Location</th>
                                    <th className="py-3 px-4 font-semibold border-b">Created By</th>
                                </tr>
                            </thead>
                            <tbody>
                                {issues.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="py-8 text-center text-gray-400 italic">No issues found.</td>
                                    </tr>
                                )}
                                {issues.map((i) => (
                                    <tr key={i._id} className="border-b transition hover:bg-gray-50 hover:shadow-inner">
                                        <td className="py-3 px-4 text-gray-800 font-medium">{i.title}</td>
                                        <td className="py-3 px-4">
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                                                {i.category}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                i.status === "Resolved" ? "bg-green-100 text-green-800" :
                                                i.status === "Pending" ? "bg-red-100 text-red-800" :
                                                "bg-yellow-100 text-yellow-800"
                                            }`}>
                                                {i.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-gray-600">{i.department}</td>
                                        <td className="py-3 px-4 text-gray-500">
                                            {i.location && (i.location.lat || i.location.lng)
                                                ? `${i.location.address || `${i.location.lat.toFixed(2)}, ${i.location.lng.toFixed(2)}`}`
                                                : "—"
                                            }
                                        </td>
                                        <td className="py-3 px-4 text-gray-600 italic">
                                            {i.createdBy?.name || "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === "approvals" && (
                <div className="animate-fadeIn">
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
                                            <div>
                                                <h4 className="text-xl font-bold text-gray-800">{o.name}</h4>
                                                <p className="text-gray-500 text-sm mt-1">{o.email}</p>
                                            </div>
                                            <span className="bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                                Pending Status
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-500 uppercase">Department</p>
                                            <p className="text-lg font-medium text-purple-700">{o.department || "General"}</p>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-b-xl flex gap-3 justify-end items-center">
                                        <button
                                            onClick={() => handleOfficerStatus(o._id, "rejected")}
                                            className="px-5 py-2 border border-red-300 text-red-600 font-medium rounded-lg hover:bg-red-50 hover:text-red-700 transition"
                                        >
                                            Reject Request
                                        </button>
                                        <button
                                            onClick={() => handleOfficerStatus(o._id, "approved")}
                                            className="px-5 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-700 shadow-md transition"
                                        >
                                            Approve Officer
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
=======
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
>>>>>>> a5355e05bb98d623a8c4f8a86aadf81c47108b0a
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
