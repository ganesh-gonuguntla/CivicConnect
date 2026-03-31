import { useEffect, useState } from "react";
import { getAllIssues, getPendingOfficers, updateOfficerStatus } from "../services/api";
import { PieChart, Pie, Cell, Legend, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

const COLORS = ["#60a5fa", "#fbbf24", "#34d399", "#f87171"];

function AdminDashboard() {
    const [issues, setIssues] = useState([]);
    const [pendingOfficers, setPendingOfficers] = useState([]);
    const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0 });
    const [byCategory, setByCategory] = useState([]);
    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await getAllIssues();
            setIssues(res.data);

            // Basic analytics computed on frontend
            const resolved = res.data.filter((i) => i.status === "Resolved").length;
            const pending = res.data.filter((i) => i.status !== "Resolved").length;

            const categoryCounts = {};
            res.data.forEach((i) => {
                categoryCounts[i.category] = (categoryCounts[i.category] || 0) + 1;
            });
            const catData = Object.entries(categoryCounts).map(([name, value]) => ({
                name,
                value,
            }));

            setStats({ total: res.data.length, resolved, pending });
            setByCategory(catData);

            // Fetch pending officers
            const officersRes = await getPendingOfficers();
            setPendingOfficers(officersRes.data);
        } catch (err) {
            console.error(err);
        }
    };

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
        </div>
    );
}

export default AdminDashboard;
