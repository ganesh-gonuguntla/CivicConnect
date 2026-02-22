import { useState } from "react";
import { createIssue } from "../services/api";

function ReportIssueForm({ onSuccess }) {
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
            setForm({ title: "", description: "", category: "", address: "", lat: "", lng: "", image: null });
            setImagePreview(null);

            if (onSuccess) onSuccess();
        } catch (err) {
            console.error(err);
            setMsg({ text: err.response?.data?.msg || "Error reporting issue", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white shadow-md p-6 rounded-2xl space-y-4">
            {msg.text && (
                <div className={`rounded-lg px-4 py-3 text-sm font-medium ${msg.type === "success"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}>
                    {msg.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    name="title"
                    placeholder="Issue Title"
                    value={form.title}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                    required
                />
                <textarea
                    name="description"
                    placeholder="Describe the issue..."
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm resize-none"
                    required
                />
                <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm bg-white"
                    required
                >
                    <option value="">Select Category</option>
                    <option value="Roads">🛣️ Roads</option>
                    <option value="Water">💧 Water</option>
                    <option value="Sanitation">🗑️ Sanitation</option>
                    <option value="Electricity">⚡ Electricity</option>
                </select>

                {/* Location */}
                <div>
                    <button
                        type="button"
                        onClick={detectLocation}
                        disabled={locating}
                        className="flex items-center gap-2 mb-2 px-4 py-2 text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors"
                    >
                        {locating ? "Detecting..." : "📍 Detect My Location"}
                    </button>

                    {form.lat && form.lng && (
                        <div className="flex gap-2 mb-2">
                            <input readOnly value={`Lat: ${form.lat}`}
                                className="flex-1 px-3 py-2 border border-green-300 bg-green-50 text-green-700 rounded-xl text-xs font-mono" />
                            <input readOnly value={`Lng: ${form.lng}`}
                                className="flex-1 px-3 py-2 border border-green-300 bg-green-50 text-green-700 rounded-xl text-xs font-mono" />
                        </div>
                    )}

                    <input
                        name="address"
                        placeholder="Or type your address / landmark"
                        value={form.address}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                    />
                </div>

                {/* Photo */}
                <div>
                    <input
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={handleChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    />
                    {imagePreview && (
                        <img src={imagePreview} alt="Preview"
                            className="mt-3 w-full h-40 object-cover rounded-xl border border-gray-200" />
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow transition-colors"
                >
                    {loading ? "Submitting..." : "🚀 Submit Issue"}
                </button>
            </form>
        </div>
    );
}

export default ReportIssueForm;
