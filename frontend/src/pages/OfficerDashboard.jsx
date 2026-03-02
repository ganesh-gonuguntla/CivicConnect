import { useEffect, useState } from "react";
import { getAssignedIssues, updateIssueStatus } from "../services/api";

function OfficerDashboard() {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(false);
    const [comment, setComment] = useState({});

    // Fetch issues assigned to this officer’s department
    const fetchIssues = async () => {
        try {
            const res = await getAssignedIssues();
            setIssues(res.data);
        } catch (err) {
            console.error("Error fetching officer issues:", err);
        }
    };

    useEffect(() => {
        fetchIssues();
    }, []);

    // Handle status change
    const handleStatusChange = async (id, newStatus) => {
        const body = {
            status: newStatus,
            comment: comment[id] || "",
        };

        try {
            setLoading(true);
            await updateIssueStatus(id, body);
            alert(`Status updated to "${newStatus}"`);
            fetchIssues();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.msg || "Update failed");
        } finally {
            setLoading(false);
        }
    };

    return (
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
                            className="bg-white p-4 shadow rounded-lg border border-gray-200"
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
            )}
        </div>
    );
}

export default OfficerDashboard;
