import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";

function Login() {
    const { login, loginWithGoogle, loading } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: (tokenResponse) => {
            if (tokenResponse?.access_token) {
                loginWithGoogle(tokenResponse.access_token);
            } else {
                alert("Google login did not return a valid token");
            }
        },
        onError: () => {
            alert("Google login was cancelled or failed");
        },
        flow: "implicit",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        login(email, password);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen ">
            <div className="bg-gray-200 p-8 rounded-xl  shadow-md w-96">
              <center>  <img src="/src/assets/favicon.png"  alt="CivicConnect Logo" className="w-12 h-12 ml-2 rounded-full" /></center>
                <h2 className="text-2xl font-bold text-purple-700 mb-4 text-center">Login</h2>
                <form onSubmit={handleSubmit} className="space-y-4 ">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border-2 border-[#FF5A5A] rounded-lg px-3 py-2"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border-2 border-[#FF5A5A] rounded-lg px-3 py-2"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-purple-700 border-2 border-white text-white py-2 rounded-lg hover:bg-purple-800"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                    <button
                        type="button"
                        disabled={loading}
                        onClick={() => handleGoogleLogin()}
                        className="w-full bg-[#3A8B95] border-2 border-white text-white py-2 rounded-lg hover:bg-purple-800 disabled:opacity-70"
                    >
                        {loading ? "Signing in with Google..." : "Sign in with Google"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;
