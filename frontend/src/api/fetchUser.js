import axios from "axios";

export const fetchUserDetails = async (userId) => {
    try {
        const response = await axios.get(`http://localhost:5000/api/users/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching user data:", error.response?.data || error.message);
        return null;
    }
};


export const updateProfilePhoto = async (userId, file) => {
    const formData = new FormData();
    formData.append("profile_pic", file);

    try {
        const response = await axios.post(`http://localhost:5000/api/users/update-photo/${userId}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response;
    } catch (error) {
        console.error("Error updating profile picture:", error.response?.data || error.message);
        throw error;
    }
};

export const deleteProfilePhoto = async (userId) => {
    try {
        const response = await axios.post(`http://localhost:5000/api/users/delete-photo/${userId}`);
        return response;
    } catch (error) {
        console.error("Error deleting profile picture:", error.response?.data || error.message);
        throw error;
    }
};
