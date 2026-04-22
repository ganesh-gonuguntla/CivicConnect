import { useState } from "react";
import { createIssue } from "../services/api";
import { useNavigate } from "react-router-dom";

function ReportIssue() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        title: "",
        description: "",
        category: "",
        address: "",
        lat: "",
        lng: "",
        image: null,
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [locating, setLocating] = useState(false);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ text: "", type: "" });

    const handleChange = (e) => {
        if (e.target.name === "image") {
            const file = e.target.files[0];
            setForm({ ...form, image: file });
            if (file) setImagePreview(URL.createObjectURL(file));
        } else {
            setForm({ ...form, [e.target.name]: e.target.value });
        }
    };

    const detectLocation = () => {
        if (!navigator.geolocation) {
            setMsg({ text: "Geolocation is not supported by your browser.", type: "error" });
            return;
        }
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setForm((prev) => ({
                    ...prev,
                    lat: pos.coords.latitude.toFixed(6),
                    lng: pos.coords.longitude.toFixed(6),
                }));
                setLocating(false);
                setMsg({ text: "📍 Location detected!", type: "success" });
                setTimeout(() => setMsg({ text: "", type: "" }), 2500);
            },
            () => {
                setLocating(false);
                setMsg({ text: "Could not detect location. Please enter address manually.", type: "error" });
            }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg({ text: "", type: "" });
        try {
            const data = new FormData();
            data.append("title", form.title);
            data.append("description", form.description);
            data.append("category", form.category);
            if (form.lat) data.append("lat", form.lat);
            if (form.lng) data.append("lng", form.lng);
            if (form.address) data.append("address", form.address);
            if (form.image) data.append("image", form.image);

            await createIssue(data);
            setMsg({ text: "Issue reported successfully!", type: "success" });
            setTimeout(() => navigate("/citizen"), 1200);
        } catch (err) {
            console.error(err);
            setMsg({ text: err.response?.data?.msg || "Error reporting issue", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-slate-950 px-6 py-6 border-b border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl -mr-16 -mt-16"></div>
                    <h2 className="text-2xl font-bold text-white relative z-10">🛠️ Report a Civic Issue</h2>
                    <p className="text-slate-400 text-sm mt-1 relative z-10">Help us fix your neighbourhood</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Feedback message */}
                    {msg.text && (
                        <div className={`rounded-lg px-4 py-3 text-sm font-medium ${msg.type === "success"
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}>
                            {msg.text}
                        </div>
                    )}

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Issue Title *</label>
                        <input
                            name="title"
                            placeholder="e.g. Broken road near market"
                            value={form.title}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Description *</label>
                        <textarea
                            name="description"
                            placeholder="Describe the issue in detail..."
                            value={form.description}
                            onChange={handleChange}
                            required
                            rows={3}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm resize-none"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Category *</label>
                        <select
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm bg-white"
                        >
                            <option value="">Select Category</option>
                            <option value="Roads">🛣️ Roads</option>
                            <option value="Water">💧 Water</option>
                            <option value="Sanitation">🗑️ Sanitation</option>
                            <option value="Electricity">⚡ Electricity</option>
                        </select>
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Location</label>

                        {/* Detect button */}
                        <button
                            type="button"
                            onClick={detectLocation}
                            disabled={locating}
                            className="flex items-center gap-2 mb-2 px-4 py-2 text-sm font-bold bg-slate-900 text-white rounded-xl hover:bg-black transition-colors shadow-lg"
                        >
                            {locating ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    Detecting...
                                </>
                            ) : (
                                <>📍 Detect My Location</>
                            )}
                        </button>

                        {/* Show detected coords */}
                        {form.lat && form.lng && (
                            <div className="flex gap-2 mb-2">
                                <input
                                    readOnly
                                    value={`Lat: ${form.lat}`}
                                    className="flex-1 px-3 py-2 border border-green-300 bg-green-50 text-green-700 rounded-xl text-xs font-mono"
                                />
                                <input
                                    readOnly
                                    value={`Lng: ${form.lng}`}
                                    className="flex-1 px-3 py-2 border border-green-300 bg-green-50 text-green-700 rounded-xl text-xs font-mono"
                                />
                            </div>
                        )}

                        {/* Manual address */}
                        <input
                            name="address"
                            placeholder="Or type your address / landmark"
                            value={form.address}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm"
                        />
                    </div>

                    {/* Photo upload */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Photo (optional)</label>
                        <input
                            type="file"
                            name="image"
                            accept="image/*"
                            onChange={handleChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 cursor-pointer"
                        />
                        {imagePreview && (
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="mt-3 w-full h-40 object-cover rounded-xl border border-gray-200"
                            />
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold rounded-xl shadow-xl shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                                Submitting...
                            </>
                        ) : "🚀 Submit Issue"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ReportIssue;
