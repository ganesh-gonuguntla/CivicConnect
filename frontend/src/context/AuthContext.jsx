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
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            setUser(res.data.user);

            // Unverified officers cannot access the dashboard yet
            if (res.data.user.role === "officer" && !res.data.user.verified) {
                navigate("/pending-verification");
            } else {
                navigate(`/${res.data.user.role}`);
            }
        } catch (err) {
            alert(err.response?.data?.msg || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    const register = async (data) => {
        try {
            setLoading(true);
            const res = await API.post("/auth/register", data);
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            setUser(res.data.user);

            // Newly registered officers need admin approval first
            if (res.data.user.role === "officer" && !res.data.user.verified) {
                navigate("/pending-verification");
            } else {
                navigate(`/${res.data.user.role}`);
            }
        } catch (err) {
            alert(err.response?.data?.msg || "Registration failed");
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
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
