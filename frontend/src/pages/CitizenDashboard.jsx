import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyIssues } from "../services/api";
import ReportIssueForm from "../components/ReportIssueForm";

function CitizenDashboard() {
    const navigate = useNavigate();
    const [issues, setIssues] = useState([]);
    const [showModal, setShowModal] = useState(false);

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

        const handleIssueReported = () => {
            fetchIssues();
        };

        window.addEventListener("issueReported", handleIssueReported);

        return () => {
            window.removeEventListener("issueReported", handleIssueReported);
        };
    }, []);

    // Get 2 most recent issues
    const recentIssues = issues.slice(0, 2);

    // Handle modal close
    const handleCloseModal = () => {
        setShowModal(false);
    };

    // Handle form success
    const handleFormSuccess = () => {
        fetchIssues();
        setShowModal(false);
    };

    return (
        <div className="p-6 bg-[linear-gradient(135deg,#FBEFEF,#F5AFAF   )]">
            {/* Hero Section with Button */}
            <div className="bg-[linear-gradient(135deg,#473472,#62109F)] text-white rounded-lg p-8 mt-8 mb-8">
                <h2 className="text-4xl font-bold mb-3">Help Improve Our Community</h2>
                <p className="text-lg mb-6">
                    If you have an issue in the surroundings, feel free to report it here. 
                    Your feedback helps us make our city better!
                </p>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-white text-[#62109F] font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition duration-200"
                >
                    + Report an Issue
                </button>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 backdrop-blur-sm bg-white/10 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                            <h3 className="text-2xl font-bold text-purple-800">Report a Civic Issue</h3>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-600 hover:text-gray-900 text-2xl"
                            >
                                ✕
                            </button>
                        </div>
                        {/* Modal Body */}
                        <div className="p-6">
                            <ReportIssueForm embedded onSuccess={handleFormSuccess} />
                        </div>
                    </div>
                </div>
            )}

            {/* Recent Issues Section */}
            <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Recent Issues You Reported</h3>
                
                {recentIssues.length === 0 ? (
                    <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-600">
                        <p className="text-lg">No issues reported yet. Start by reporting one!</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {recentIssues.map((issue) => (
                                <div
                                    key={issue._id}
                                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200"
                                >
                                    {/* Image Section */}
                                    {issue.imageURL && (
                                        <div className="w-full h-56 overflow-hidden bg-gray-200">
                                            <img
                                                src={issue.imageURL}
                                                alt={issue.title}
                                                className="w-full h-full object-cover hover:scale-105 transition duration-200"
                                            />
                                        </div>
                                    )}
                                    
                                    {/* Content Section */}
                                    <div className="p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <h4 className="text-lg font-semibold text-purple-800 flex-1">{issue.title}</h4>
                                            <span
                                                className={`text-xs font-semibold px-2 py-1 rounded whitespace-nowrap ml-2 ${
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
                                        <p className="text-gray-700 text-sm mb-3 line-clamp-2">{issue.description}</p>
                                        <div className="flex items-center justify-between text-xs text-gray-600">
                                            <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                                {issue.category}
                                            </span>
                                            {issue.location?.address && (
                                                <span className="text-right">📍 {issue.location.address}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* More Button */}
                        {issues.length > 2 && (
                            <div className="text-center mt-6">
                                <button
                                    onClick={() => navigate("/my-issues")}
                                    className="bg-purple-700 text-white px-8 py-2 rounded-lg hover:bg-purple-800 transition duration-200 font-semibold"
                                >
                                    View All Issues ({issues.length} total)
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default CitizenDashboard;
