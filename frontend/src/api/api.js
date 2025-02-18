import axios from "axios";

const API_URL = "http://localhost:5000/api";

export const register = (userData) => axios.post(`${API_URL}/auth/register`, userData);
export const login = (userData) => axios.post(`${API_URL}/auth/login`, userData);
// export const getPosts = () => axios.get(`${API_URL}/posts`);
