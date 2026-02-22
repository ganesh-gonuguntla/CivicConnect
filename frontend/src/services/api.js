// src/services/api.js
import axios from "axios";

// Change if backend runs elsewhere
const API = axios.create({
    baseURL: "http://localhost:3000/api",
});

// Automatically attach token to requests (if logged in)
API.interceptors.request.use((req) => {
    const token = localStorage.getItem("token");
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export default API;

export const createIssue = (formData) =>
    API.post("/issues", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

export const getMyIssues = () => API.get("/issues/my");

// Officer endpoints
export const getAssignedIssues = () => API.get("/issues/assigned");

export const updateIssueStatus = (id, data) =>
    API.put(`/issues/${id}/status`, data);

// Admin endpoints
export const getAllIssues = () => API.get("/issues/all");
export const getAnalytics = () => API.get("/issues/analytics");

// Officer management (admin only)
export const getOfficers = () => API.get("/users/officers");
export const verifyOfficer = (id) => API.put(`/users/${id}/verify`);
export const unverifyOfficer = (id) => API.put(`/users/${id}/unverify`);
