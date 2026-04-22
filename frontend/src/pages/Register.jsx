import { useState } from "react";
import { Link } from "react-router-dom";
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
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Card */}
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    {/* Header gradient */}
                    <div className="bg-slate-950 px-8 py-12 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <div className="w-16 h-16 mx-auto mb-4 bg-white/10 backdrop-blur-md rounded-2xl shadow-lg flex items-center justify-center border border-white/10">
                            <img src="/src/assets/favicon.png" alt="CivicConnect Logo" className="w-10 h-10" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">Join Us</h2>
                        <p className="text-slate-400">Create your CivicConnect account</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="px-8 py-8 space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                            <input
                                name="name"
                                placeholder="John Doe"
                                value={form.name}
                                onChange={handleChange}
                                className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                            <input
                                name="email"
                                type="email"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={handleChange}
                                className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                            <input
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={handleChange}
                                className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">I am a</label>
                            <select
                                name="role"
                                value={form.role}
                                onChange={handleChange}
                                className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition"
                            >
                                <option value="citizen">Citizen</option>
                                <option value="officer">City Officer</option>
                                <option value="admin">Administrator</option>
                            </select>
                        </div>

                        {/* Department Dropdown - only for officers */}
                        {form.role === "officer" && (
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Department</label>
                                <select
                                    name="department"
                                    value={form.department}
                                    onChange={handleChange}
                                    className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition"
                                    required
                                >
                                    <option value="">Select Department</option>
                                    <option value="Roads">Roads</option>
                                    <option value="Water">Water</option>
                                    <option value="Sanitation">Sanitation</option>
                                    <option value="Electricity">Electricity</option>
                                </select>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white py-3 rounded-lg hover:from-orange-600 hover:to-amber-700 transition duration-200 font-semibold shadow-lg shadow-orange-500/20 disabled:opacity-50 mt-6"
                        >
                            {loading ? "Creating account..." : "Create Account"}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="px-8 py-6 bg-slate-50 border-t border-slate-200 text-center">
                        <p className="text-slate-600 text-sm">
                            Already have an account?{" "}
                            <Link to="/login" className="font-semibold text-orange-600 hover:text-orange-700 transition">
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
