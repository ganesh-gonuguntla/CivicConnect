import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyIssues } from "../services/api";

function AllMyIssues() {
    const navigate = useNavigate();
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    // 🧭 Fetch user's issues
    const fetchIssues = async () => {
        try {
            setLoading(true);
            const res = await getMyIssues();
            setIssues(res.data);
        } catch (err) {
            console.error("Error fetching issues:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIssues();
    }, []);

    // Filter issues based on status
    const filteredIssues = filter === "all" 
        ? issues 
        : issues.filter(issue => issue.status === filter);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-3xl font-bold text-gray-800">Your Reported Issues</h2>
                    <button
                        onClick={() => navigate("/citizen")}
                        className="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                        ← Back to Dashboard
                    </button>
                </div>
                <p className="text-gray-600">Total Issues: {issues.length}</p>
            </div>

            {/* Filter Buttons */}
            <div className="mb-6 flex gap-3 flex-wrap">
                <button
                    onClick={() => setFilter("all")}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                        filter === "all"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                >
                    All ({issues.length})
                </button>
                <button
                    onClick={() => setFilter("Pending")}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                        filter === "Pending"
                            ? "bg-red-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                >
                    Pending ({issues.filter(i => i.status === "Pending").length})
                </button>
                <button
                    onClick={() => setFilter("In Progress")}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                        filter === "In Progress"
                            ? "bg-yellow-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                >
                    In Progress ({issues.filter(i => i.status === "In Progress").length})
                </button>
                <button
                    onClick={() => setFilter("Resolved")}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                        filter === "Resolved"
                            ? "bg-green-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                >
                    Resolved ({issues.filter(i => i.status === "Resolved").length})
                </button>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="text-center py-12">
                    <p className="text-gray-600 text-lg">Loading issues...</p>
                </div>
            ) : filteredIssues.length === 0 ? (
                <div className="bg-gray-100 rounded-lg p-12 text-center">
                    <p className="text-gray-600 text-lg">
                        {filter === "all"
                            ? "No issues reported yet."
                            : `No ${filter.toLowerCase()} issues.`}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredIssues.map((issue) => (
                        <div
                            key={issue._id}
                            className="bg-white rounded-lg shadow-md hover:shadow-lg transition duration-200 overflow-hidden"
                        >
                            <div className="flex flex-col md:flex-row">
                                {/* Image */}
                                {issue.imageURL && (
                                    <div className="md:w-48 h-48 md:h-auto bg-gray-200 flex-shrink-0">
                                        <img
                                            src={issue.imageURL}
                                            alt={issue.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}

                                {/* Content */}
                                <div className="flex-1 p-6 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-start justify-between mb-3">
                                            <h3 className="text-xl font-bold text-blue-700 flex-1">{issue.title}</h3>
                                            <span
                                                className={`text-xs font-semibold px-3 py-1 rounded whitespace-nowrap ml-2 ${
                                                    issue.status === "Resolved"
                                                        ? "bg-green-100 text-green-800"
                                                        : issue.status === "In Progress"
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : "bg-red-100 text-red-800"
                                                }`}
                                            >
                                                {issue.status}
                                            </span>
                                        </div>
                                        <p className="text-gray-700 mb-4">{issue.description}</p>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                                        <div>
                                            <p className="font-semibold text-gray-800">Category</p>
                                            <p className="text-blue-600">{issue.category}</p>
                                        </div>
                                        {issue.location?.address && (
                                            <div>
                                                <p className="font-semibold text-gray-800">Location</p>
                                                <p className="text-gray-700">{issue.location.address}</p>
                                            </div>
                                        )}
                                        {issue.createdAt && (
                                            <div>
                                                <p className="font-semibold text-gray-800">Reported On</p>
                                                <p className="text-gray-700">
                                                    {new Date(issue.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        )}
                                        {issue.department?.name && (
                                            <div>
                                                <p className="font-semibold text-gray-800">Department</p>
                                                <p className="text-gray-700">{issue.department.name}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default AllMyIssues;
