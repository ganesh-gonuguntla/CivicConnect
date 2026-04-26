import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() =>
        JSON.parse(localStorage.getItem("user"))
    );
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const login = async (email, password) => {
        try {
            setLoading(true);
            const res = await API.post("/auth/login", { email, password });
            
            // Check if email needs verification
            if (res.data.requiresOTPVerification) {
                alert(res.data.msg);
                navigate("/register");
                return false;
            }

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            setUser(res.data.user);

            // Unverified officers cannot access the dashboard yet
            if (res.data.user.role === "officer" && !res.data.user.verified) {
                navigate("/pending-verification");
            } else {
                navigate(`/${res.data.user.role}`);
            }
            return true;
        } catch (err) {
            alert(err.response?.data?.msg || "Login failed");
            return false;
        } finally {
            setLoading(false);
        }
    };

    const loginWithGoogle = async (googleAccessToken) => {
        try {
            setLoading(true);
            const res = await API.post("/auth/google", {
                access_token: googleAccessToken,
            });
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            setUser(res.data.user);
            navigate(`/${res.data.user.role}`);
        } catch (err) {
            alert(err.response?.data?.msg || "Google login failed");
        } finally {
            setLoading(false);
        }
    };

    const register = async (data) => {
        try {
            setLoading(true);
            const res = await API.post("/auth/register", data);
            
            // Registration successful, user needs to verify OTP
            if (res.data.requiresOTPVerification) {
                return true; // Return true to proceed to OTP verification
            }

            // Fallback for old registration flow (shouldn't happen)
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            setUser(res.data.user);

            if (res.data.user.role === "officer" && !res.data.user.verified) {
                navigate("/pending-verification");
            } else {
                navigate(`/${res.data.user.role}`);
            }
            return true;
        } catch (err) {
            alert(err.response?.data?.msg || "Registration failed");
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
        navigate("/login");
    };

    return (
        <AuthContext.Provider value={{ user, login, loginWithGoogle, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
