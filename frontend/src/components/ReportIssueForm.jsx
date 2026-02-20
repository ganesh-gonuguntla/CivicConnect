import { useState } from "react";
import { createIssue } from "../services/api";

function ReportIssueForm({ onSuccess }) {
    const [form, setForm] = useState({
        title: "",
        description: "",
        category: "",
        location: "", // e.g., '{"lat":12.34,"lng":56.78}'
        image: null,
    });

    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");

    const handleChange = (e) => {
        if (e.target.name === "image") {
            setForm({ ...form, image: e.target.files[0] });
        } else {
            setForm({ ...form, [e.target.name]: e.target.value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg("");

        try {
            const data = new FormData();
            data.append("title", form.title);
            data.append("description", form.description);
            data.append("category", form.category);
            data.append("location", form.location);
            if (form.image) data.append("image", form.image);

            await createIssue(data); // API call
            setMsg("Issue reported successfully!");
            setForm({ title: "", description: "", category: "", location: "", image: null });

            if (onSuccess) onSuccess(); // refresh list in dashboard if provided
        } catch (err) {
            console.error(err);
            setMsg(err.response?.data?.msg || "Error reporting issue");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white shadow-md p-6 rounded space-y-4">
            {msg && <p className="text-red-500">{msg}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    name="title"
                    placeholder="Title"
                    value={form.title}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                />
                <textarea
                    name="description"
                    placeholder="Description"
                    value={form.description}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                />
                <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                >
                    <option value="">Select Category</option>
                    <option value="Roads">Roads</option>
                    <option value="Water">Water</option>
                    <option value="Sanitation">Sanitation</option>
                    <option value="Electricity">Electricity</option>
                </select>
                <input
                    name="location"
                    placeholder='{"lat":12.34,"lng":56.78}'
                    value={form.location}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                />
                <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleChange}
                    className="w-full"
                />
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                    disabled={loading}
                >
                    {loading ? "Submitting..." : "Report Issue"}
                </button>
            </form>
        </div>
    );
}

export default ReportIssueForm;
