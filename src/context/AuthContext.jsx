import React, { createContext, useState, useEffect, useContext } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUserLoggedIn();
    }, []);

    const checkUserLoggedIn = async () => {
        try {
            const token = localStorage.getItem("token"); // Standardized key 'token'
            if (token) {
                // Optional: Verify token with backend /profile endpoint if strict check needed
                // For now, loading user from local storage or fetching profile
                const storedUser = localStorage.getItem("user");
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                } else {
                    // Fallback: fetch profile if token exists but user data missing
                    const res = await api.get("/auth/profile");
                    if (res.data.success) {
                        setUser(res.data.user);
                        localStorage.setItem("user", JSON.stringify(res.data.user));
                    }
                }
            }
        } catch (error) {
            console.error("Auth check failed:", error);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const res = await api.post("/auth/login", { email, password });
        if (res.data.success) {
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            setUser(res.data.user);
            return res.data;
        }
        throw new Error(res.data.error || "Login failed");
    };

    const register = async (username, email, password) => {
        const res = await api.post("/auth/register", { username, email, password });
        if (res.data.success) {
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            setUser(res.data.user);
            return res.data;
        }
        throw new Error(res.data.error || "Registration failed");
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // Also remove old keys if present
        localStorage.removeItem("authToken");
        localStorage.removeItem("user_data");

        setUser(null);
        window.location.href = "/";
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
