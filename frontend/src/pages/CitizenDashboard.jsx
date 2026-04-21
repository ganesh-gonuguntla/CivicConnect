import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyIssues } from "../services/api";
import ReportIssueForm from "../components/ReportIssueForm";

function CitizenDashboard() {
    const navigate = useNavigate();
    const [issues, setIssues] = useState([]);
    const [showModal, setShowModal] = useState(false);

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

    const recentIssues = issues.slice(0, 3);

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleFormSuccess = () => {
        fetchIssues();
        setShowModal(false);
    };

    const statusColors = {
        "Resolved": "bg-emerald-100 text-emerald-700 border-l-4 border-emerald-500",
        "In Progress": "bg-amber-100 text-amber-700 border-l-4 border-amber-500",
        "Pending": "bg-red-100 text-red-700 border-l-4 border-red-500"
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-700 text-white px-6 py-16 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-white"></div>
                </div>
                <div className="max-w-4xl mx-auto relative z-10">
                    <h1 className="text-5xl font-bold mb-4">Make Your City Better</h1>
                    <p className="text-lg text-blue-100 mb-8 max-w-2xl">
                        Report civic issues in your community. Every issue you report helps improve our city.
                    </p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-white text-blue-700 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition duration-200 shadow-lg inline-flex items-center gap-2"
                    >
                        <span className="text-2xl">+</span>
                        Report a New Issue
                    </button>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-6 flex justify-between items-center">
                            <h3 className="text-2xl font-bold text-white">Report a Civic Issue</h3>
                            <button
                                onClick={handleCloseModal}
                                className="text-white hover:text-blue-100 text-3xl font-light"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-6">
                            <ReportIssueForm embedded onSuccess={handleFormSuccess} />
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-6 py-12">
                {/* Stats Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                    <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
                        <p className="text-slate-600 text-sm font-medium">Total Reported</p>
                        <p className="text-4xl font-bold text-blue-600 mt-2">{issues.length}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-emerald-500">
                        <p className="text-slate-600 text-sm font-medium">Resolved</p>
                        <p className="text-4xl font-bold text-emerald-600 mt-2">{issues.filter(i => i.status === "Resolved").length}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-amber-500">
                        <p className="text-slate-600 text-sm font-medium">In Progress</p>
                        <p className="text-4xl font-bold text-amber-600 mt-2">{issues.filter(i => i.status === "In Progress").length}</p>
                    </div>
                </div>

                {/* Recent Issues Section */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-3xl font-bold text-slate-900">Your Recent Issues</h2>
                        {issues.length > 3 && (
                            <button
                                onClick={() => navigate("/my-issues")}
                                className="text-blue-600 hover:text-blue-700 font-semibold"
                            >
                                View All ({issues.length})
                            </button>
                        )}
                    </div>
                    
                    {recentIssues.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                            <div className="text-5xl mb-4">📝</div>
                            <p className="text-slate-600 text-lg font-medium">No issues reported yet</p>
                            <p className="text-slate-500 text-sm mt-2">Start by reporting an issue to help improve your community</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recentIssues.map((issue) => (
                                <div
                                    key={issue._id}
                                    className="bg-white rounded-xl shadow-sm hover:shadow-lg transition duration-200 overflow-hidden cursor-pointer group"
                                    onClick={() => navigate("/my-issues")}
                                >
                                    {/* Image Section */}
                                    {issue.imageURL && (
                                        <div className="w-full h-48 overflow-hidden bg-slate-200">
                                            <img
                                                src={issue.imageURL}
                                                alt={issue.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                                            />
                                        </div>
                                    )}
                                    
                                    {/* Content Section */}
                                    <div className="p-5">
                                        <div className="flex items-start justify-between mb-2 gap-2">
                                            <h4 className="text-lg font-bold text-slate-900 flex-1 line-clamp-2">{issue.title}</h4>
                                        </div>
                                        
                                        <p className="text-slate-600 text-sm mb-4 line-clamp-2">{issue.description}</p>
                                        
                                        <div className="flex flex-col gap-3">
                                            <span className={`text-xs font-semibold px-3 py-2 rounded-lg inline-block w-fit ${statusColors[issue.status] || statusColors["Pending"]}`}>
                                                {issue.status}
                                            </span>
                                            
                                            <div className="flex items-center justify-between text-xs text-slate-600">
                                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                                    {issue.category}
                                                </span>
                                                {issue.location?.address && (
                                                    <span className="text-right truncate">📍 {issue.location.address}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CitizenDashboard;
