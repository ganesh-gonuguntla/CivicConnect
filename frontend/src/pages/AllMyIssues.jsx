import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyIssues, submitFeedback } from "../services/api";

/* ── Star-rating feedback form shown on resolved issues ─────── */
function FeedbackForm({ issue, onSubmitted }) {
    const [rating, setRating] = useState(0);
    const [hovered, setHovered] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) { setError("Please select a star rating."); return; }
        setSubmitting(true);
        setError("");
        try {
            await submitFeedback(issue._id, { rating, comment });
            onSubmitted({ rating, comment, submittedAt: new Date().toISOString() });
        } catch (err) {
            setError(err.response?.data?.msg || "Failed to submit feedback. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-5 border-t border-slate-200 pt-5">
            <h4 className="text-base font-bold text-slate-900 mb-4">⭐ Rate This Resolution</h4>
            {/* Star Row */}
            <div className="flex gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHovered(star)}
                        onMouseLeave={() => setHovered(0)}
                        className={`text-4xl transition-transform hover:scale-125 ${
                            star <= (hovered || rating) ? "text-amber-400" : "text-slate-300"
                        }`}
                    >
                        ★
                    </button>
                ))}
                {rating > 0 && (
                    <span className="ml-2 text-sm text-slate-600 self-center font-medium">
                        {["Poor", "Fair", "Good", "Very Good", "Excellent"][rating - 1]}
                    </span>
                )}
            </div>
            {/* Comment */}
            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience (optional)…"
                rows={3}
                className="w-full border-2 border-slate-200 bg-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none mb-4"
            />
            {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
            <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-700 text-white font-semibold rounded-lg hover:from-violet-700 hover:to-purple-800 transition disabled:opacity-50"
            >
                {submitting ? "Submitting…" : "Submit Feedback"}
            </button>
        </form>
    );
}

function AllMyIssues() {
    const navigate = useNavigate();
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [selectedIssue, setSelectedIssue] = useState(null);

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
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-slate-950 border-b border-white/5 text-white px-6 py-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="max-w-6xl mx-auto flex items-center justify-between relative z-10">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">All Your Issues</h1>
                        <p className="text-slate-400">Track and manage all issues you've reported</p>
                    </div>
                    <button
                        onClick={() => navigate("/citizen")}
                        className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-semibold transition backdrop-blur-md border border-white/10"
                    >
                        ← Back to Dashboard
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-12">
                {/* Filter Buttons */}
                <div className="mb-8 flex gap-3 flex-wrap">
                    <button
                        onClick={() => setFilter("all")}
                        className={`px-4 py-2 rounded-lg font-bold transition shadow-sm ${
                            filter === "all"
                                ? "bg-orange-600 text-white shadow-orange-500/20"
                                : "bg-white text-slate-600 border-2 border-slate-100 hover:border-orange-200"
                        }`}
                    >
                        All ({issues.length})
                    </button>
                    <button
                        onClick={() => setFilter("Pending")}
                        className={`px-4 py-2 rounded-lg font-semibold transition ${
                            filter === "Pending"
                                ? "bg-red-600 text-white"
                                : "bg-white text-slate-700 border-2 border-slate-200 hover:border-red-400"
                        }`}
                    >
                        Pending ({issues.filter(i => i.status === "Pending").length})
                    </button>
                    <button
                        onClick={() => setFilter("In Progress")}
                        className={`px-4 py-2 rounded-lg font-semibold transition ${
                            filter === "In Progress"
                                ? "bg-amber-600 text-white"
                                : "bg-white text-slate-700 border-2 border-slate-200 hover:border-amber-400"
                        }`}
                    >
                        In Progress ({issues.filter(i => i.status === "In Progress").length})
                    </button>
                    <button
                        onClick={() => setFilter("Resolved")}
                        className={`px-4 py-2 rounded-lg font-semibold transition ${
                            filter === "Resolved"
                                ? "bg-emerald-600 text-white"
                                : "bg-white text-slate-700 border-2 border-slate-200 hover:border-emerald-400"
                        }`}
                    >
                        Resolved ({issues.filter(i => i.status === "Resolved").length})
                    </button>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="text-center py-16">
                        <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full mx-auto animate-spin mb-4"></div>
                        <p className="text-slate-600 text-lg">Loading issues...</p>
                    </div>
                ) : filteredIssues.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center border-2 border-dashed border-slate-200">
                        <p className="text-slate-600 text-lg font-medium">
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
                                onClick={() => setSelectedIssue(issue)}
                                className="bg-white rounded-xl shadow-sm hover:shadow-md transition duration-200 overflow-hidden cursor-pointer border border-slate-200"
                            >
                                <div className="flex flex-col md:flex-row">
                                    {/* Image */}
                                    {issue.imageURL && (
                                        <div className="md:w-52 h-48 md:h-auto bg-slate-200 flex-shrink-0">
                                            <img
                                                src={issue.imageURL}
                                                alt={issue.title}
                                                className="w-full h-full object-cover hover:opacity-90 transition"
                                            />
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="flex-1 p-6 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-start justify-between mb-3 gap-2">
                                                <h3 className="text-xl font-bold text-slate-900 flex-1">{issue.title}</h3>
                                                <span
                                                    className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ${
                                                        issue.status === "Resolved"
                                                            ? "bg-emerald-100 text-emerald-700"
                                                            : issue.status === "In Progress"
                                                                ? "bg-amber-100 text-amber-700"
                                                                : "bg-red-100 text-red-700"
                                                    }`}
                                                >
                                                    {issue.status}
                                                </span>
                                            </div>
                                            <p className="text-slate-600 mb-4">{issue.description}</p>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600 pb-4 border-t border-slate-100 pt-4">
                                            <div>
                                                <p className="font-semibold text-slate-900">Category</p>
                                                <p className="text-violet-600 font-medium">{issue.category}</p>
                                            </div>
                                            {issue.location?.address && (
                                                <div>
                                                    <p className="font-semibold text-slate-900">Location</p>
                                                    <p className="text-slate-700 truncate">{issue.location.address}</p>
                                                </div>
                                            )}
                                            {issue.createdAt && (
                                                <div>
                                                    <p className="font-semibold text-slate-900">Reported On</p>
                                                    <p className="text-slate-700">
                                                        {new Date(issue.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-semibold text-slate-900">Officer</p>
                                                {issue.assignedOfficer?.name ? (
                                                    <p className="text-violet-600 font-medium flex items-center gap-1">
                                                        👤 {issue.assignedOfficer.name}
                                                    </p>
                                                ) : (
                                                    <p className="text-slate-400 italic">Unassigned</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Chat button */}
                                        {issue.assignedOfficer?._id && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); navigate(`/chat/${issue._id}`); }}
                                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white text-sm font-bold rounded-lg hover:from-orange-600 hover:to-amber-700 transition shadow-lg shadow-orange-500/10 w-fit"
                                            >
                                                💬 Chat with Officer
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Issue Detail Modal */}
                {selectedIssue && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-2xl max-w-xl w-full p-6 overflow-y-auto max-h-[90vh] shadow-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-slate-900">{selectedIssue.title}</h3>
                                <button onClick={() => setSelectedIssue(null)} className="text-2xl text-slate-400 hover:text-slate-600">✕</button>
                            </div>

                            {selectedIssue.imageURL && (
                                <div className="mb-6 rounded-xl overflow-hidden">
                                    <img src={selectedIssue.imageURL} alt={selectedIssue.title} className="w-full h-64 object-cover" />
                                </div>
                            )}

                            <div className="mb-6 text-slate-700 leading-relaxed">{selectedIssue.description}</div>

                            <div className="grid grid-cols-2 gap-4 text-sm mb-6 pb-6 border-b border-slate-200">
                                <div>
                                    <p className="font-semibold text-slate-900">Status</p>
                                    <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${
                                        selectedIssue.status === "Resolved"
                                            ? "bg-emerald-100 text-emerald-700"
                                            : selectedIssue.status === "In Progress"
                                                ? "bg-amber-100 text-amber-700"
                                                : "bg-red-100 text-red-700"
                                    }`}>
                                        {selectedIssue.status}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900">Reported On</p>
                                    <p>{new Date(selectedIssue.createdAt).toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900">Accepted On</p>
                                    <p>{selectedIssue.acceptedAt ? new Date(selectedIssue.acceptedAt).toLocaleString() : '—'}</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900">Resolved On</p>
                                    <p>{selectedIssue.resolvedAt ? new Date(selectedIssue.resolvedAt).toLocaleString() : '—'}</p>
                                </div>
                            </div>

                            <div className="mb-6 text-sm bg-slate-50 rounded-lg p-4">
                                <p className="font-semibold text-slate-900 mb-3">📋 Tracking Details</p>
                                <ul className="space-y-2 text-slate-700">
                                    <li><span className="font-medium">Category:</span> {selectedIssue.category}</li>
                                    <li><span className="font-medium">Department:</span> {selectedIssue.department || '—'}</li>
                                    <li><span className="font-medium">Location:</span> {selectedIssue.location?.address || '—'}</li>
                                    <li><span className="font-medium">Assigned Officer:</span> {selectedIssue.assignedOfficer?.name || 'Not assigned'}</li>
                                </ul>
                            </div>

                            {/* ── Feedback area ── */}
                            {selectedIssue.status === "Resolved" && (
                                selectedIssue.feedback?.submitted ? (
                                    <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                                        <p className="text-emerald-700 font-bold text-sm mb-3">✅ Feedback Submitted</p>
                                        <div className="flex gap-0.5 mb-2">
                                            {[1,2,3,4,5].map(s => (
                                                <span key={s} className={`text-xl ${ s <= selectedIssue.feedback.rating ? "text-amber-400" : "text-slate-300"}`}>★</span>
                                            ))}
                                        </div>
                                        {selectedIssue.feedback.comment && (
                                            <p className="text-slate-600 text-sm italic">"{selectedIssue.feedback.comment}"</p>
                                        )}
                                        <p className="text-xs text-slate-500 mt-2">
                                            Submitted on {new Date(selectedIssue.feedback.submittedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                ) : (
                                    <FeedbackForm
                                        issue={selectedIssue}
                                        onSubmitted={(fb) => {
                                            setSelectedIssue(prev => ({
                                                ...prev,
                                                feedback: { submitted: true, ...fb }
                                            }));
                                            setIssues(prev => prev.map(i =>
                                                i._id === selectedIssue._id
                                                    ? { ...i, feedback: { submitted: true, ...fb } }
                                                    : i
                                            ));
                                        }}
                                    />
                                )
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AllMyIssues;
