import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function Register() {
    const { register, loading } = useAuth();
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "citizen",
        department: ""
    });

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        register(form);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <div className="bg-white p-8 rounded-xl shadow-md w-96">
                <h2 className="text-2xl font-bold text-green-600 mb-4 text-center">
                    Register
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        name="name"
                        placeholder="Full Name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        required
                    />
                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        required
                    />
                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        required
                    />

                    <select
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                        <option value="citizen">Citizen</option>
                        <option value="officer">Officer</option>
                        <option value="admin">Admin</option>
                    </select>

                    {/* Department Dropdown - only for officers */}
                    {form.role === "officer" && (
                        <select
                            name="department"
                            value={form.department}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            required
                        >
                            <option value="">Select Department</option>
                            <option value="Roads">Roads</option>
                            <option value="Water">Water</option>
                            <option value="Sanitation">Sanitation</option>
                            <option value="Electricity">Electricity</option>
                        </select>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                    >
                        {loading ? "Registering..." : "Register"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Register;
