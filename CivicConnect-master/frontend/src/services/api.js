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

export const updateProfile = (data) => API.put('/auth/update', data);
export const getNotifications = () => API.get('/auth/notifications');
export const getProfile = () => API.get('/auth/me');
export const getLeaderboard = () => API.get('/auth/leaderboard');
export const markNotificationsRead = (ids = []) => API.put('/auth/notifications/read', { ids });

// Officer endpoints
export const getAssignedIssues = () => API.get("/issues/assigned");

export const updateIssueStatus = (id, data) =>
    API.put(`/issues/${id}/status`, data);

// Admin endpoints
export const getAllIssues = () => API.get("/issues/all");
export const getAnalytics = () => API.get("/issues/analytics");
export const getPendingOfficers = () => API.get("/auth/officers/pending");
export const updateOfficerStatus = (id, status) => API.put(`/auth/officers/${id}/status`, { status });
export const deleteIssue = (id) => API.delete(`/issues/${id}`);
export const submitFeedback = (id, data) => API.post(`/issues/${id}/feedback`, data);

// Chat endpoints
export const getChatMessages = (issueId, page = 1) => API.get(`/chat/${issueId}?page=${page}`);
export const markChatRead = (issueId) => API.post(`/chat/${issueId}/read`);
export const editChatMessage = (msgId, text) => API.put(`/chat/message/${msgId}`, { text });
export const uploadChatMedia = (issueId, formData) =>
    API.post(`/chat/${issueId}/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
