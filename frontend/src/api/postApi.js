import axios from "axios";

const API_URL = "http://localhost:5000/api/posts";

const handleTokenError = (error) => {
    if (error.response?.status === 401) {
        console.error("Session expired. Logging out...");
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        window.location.href = "/login"; // Redirect to login page
    }
};

export const fetchAllPosts = async () => {
    return axios.get(`${API_URL}/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }).catch(handleTokenError);
};

export const fetchMyPosts = async (userId) => {
    return axios.get(`${API_URL}/my/${userId}`, { // 🔹 No need to pass userId in URL, use token instead
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }).catch(handleTokenError);
};
