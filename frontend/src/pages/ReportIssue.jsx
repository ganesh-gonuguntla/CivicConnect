import { useState } from "react";
import { createIssue } from "../services/api";
import { useNavigate } from "react-router-dom";

function ReportIssue() {
    const navigate = useNavigate();
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
            setLoading(false);
            navigate("/citizen"); // redirect to dashboard after submit
        } catch (err) {
            console.error(err);
            setMsg(err.response?.data?.msg || "Error reporting issue");
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded mt-6">
            {/* <h2 className="text-2xl font-bold mb-4">Report a Civic Issue</h2> */}
            {msg && <p className="mb-4 text-red-500">{msg}</p>}
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
                    className="w-full bg-purple-600 text-white p-2 rounded hover:bg-purple-700"
                    disabled={loading}
                >
                    {loading ? "Submitting..." : "Report Issue"}
                </button>
            </form>
        </div>
    );
}

export default ReportIssue;
