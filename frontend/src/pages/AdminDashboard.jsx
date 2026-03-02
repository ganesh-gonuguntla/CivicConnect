import { useEffect, useState } from "react";
import { getAllIssues } from "../services/api";
import { PieChart, Pie, Cell, Legend, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

const COLORS = ["#60a5fa", "#fbbf24", "#34d399", "#f87171"];

function AdminDashboard() {
    const [issues, setIssues] = useState([]);
    const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0 });
    const [byCategory, setByCategory] = useState([]);

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
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-3xl font-bold text-purple-800 mb-4">Admin Dashboard</h2>

            {/* 🧮 Basic Stats */}
            <div className="flex flex-wrap gap-4 mb-6">
                <div className="bg-white shadow p-4 rounded-lg flex-1 text-center">
                    <h3 className="text-gray-500">Total Issues</h3>
                    <p className="text-3xl font-bold text-purple-700">{stats.total}</p>
                </div>
                <div className="bg-white shadow p-4 rounded-lg flex-1 text-center">
                    <h3 className="text-gray-500">Resolved</h3>
                    <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
                </div>
                <div className="bg-white shadow p-4 rounded-lg flex-1 text-center">
                    <h3 className="text-gray-500">Pending</h3>
                    <p className="text-3xl font-bold text-red-600">{stats.pending}</p>
                </div>
            </div>

            {/* 📊 Charts */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Issue Categories</h3>
                    <PieChart width={300} height={300}>
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

                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Resolved vs Pending</h3>
                    <BarChart width={300} height={300} data={[stats]}>
                        <XAxis dataKey="total" hide />
                        <YAxis hide />
                        <Tooltip />
                        <Bar dataKey="resolved" fill="#34d399" />
                        <Bar dataKey="pending" fill="#f87171" />
                    </BarChart>
                </div>
            </div>

            {/* 📋 All Issues List */}
            <h3 className="text-2xl font-semibold mb-3">All Reported Issues</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow rounded-lg">
                    <thead className="bg-purple-100">
                        <tr>
                            <th className="py-2 px-3 text-left">Title</th>
                            <th className="py-2 px-3 text-left">Category</th>
                            <th className="py-2 px-3 text-left">Status</th>
                            <th className="py-2 px-3 text-left">Department</th>
                            <th className="py-2 px-3 text-left">Location</th>
                            <th className="py-2 px-3 text-left">Created By</th>
                        </tr>
                    </thead>
                    <tbody>
                        {issues.map((i) => (
                            <tr key={i._id} className="border-t">
                                <td className="py-2 px-3">{i.title}</td>
                                <td className="py-2 px-3">{i.category}</td>
                                <td className="py-2 px-3">{i.status}</td>
                                <td className="py-2 px-3">{i.department}</td>
                                <td className="py-2 px-3 text-sm">
                                    {i.location && (i.location.lat || i.location.lng)
                                        ? `${i.location.address || `${i.location.lat}, ${i.location.lng}`}`
                                        : "—"
                                    }
                                </td>
                                <td className="py-2 px-3">
                                    {i.createdBy?.name || "—"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminDashboard;
