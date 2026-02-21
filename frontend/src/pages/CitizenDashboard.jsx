import { useEffect, useState } from "react";
import { getMyIssues } from "../services/api";
import ReportIssueForm from "../components/ReportIssueForm"; // <-- import the new form component

function CitizenDashboard() {
    const [issues, setIssues] = useState([]);

    // 🧭 Fetch user's issues
    const fetchIssues = async () => {
        try {
            const res = await getMyIssues();
            setIssues(res.data);
        } catch (err) {
            console.error("Error fetching issues:", err);
        }
    };

    useEffect(() => {
        fetchIssues();
    }, []);

    return (
        <div className="p-6">
            <h2 className="text-3xl font-bold text-blue-700 mb-4">
                🧾 Report a Civic Issue
            </h2>

            {/* 🔹 ReportIssueForm handles all form logic including image upload */}
            <ReportIssueForm onSuccess={fetchIssues} />

            {/* 📋 List of Reported Issues */}
            <h3 className="text-2xl font-semibold mt-10 mb-3">Your Reported Issues</h3>
            {issues.length === 0 ? (
                <p className="text-gray-600">No issues reported yet.</p>
            ) : (
                <div className="grid md:grid-cols-2 gap-4">
                    {issues.map((issue) => (
                        <div
                            key={issue._id}
                            className="bg-white p-4 shadow rounded-lg border border-gray-200"
                        >
                            <h4 className="text-lg font-semibold text-blue-700">{issue.title}</h4>
                            <p className="text-gray-700">{issue.description}</p>
                            {issue.imageURL && (
                                <img
                                    src={issue.imageURL}
                                    alt={issue.title}
                                    className="w-full h-48 object-cover mt-2 rounded"
                                />
                            )}
                            <p className="text-sm text-gray-500 mt-1">
                                Category: {issue.category} | Status:{" "}
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
                            {issue.location && (issue.location.lat || issue.location.lng) && (
                                <p className="text-sm text-gray-600 mt-1">
                                    📍 Location: {issue.location.address || `${issue.location.lat}, ${issue.location.lng}`}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default CitizenDashboard;
