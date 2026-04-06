import axios from "axios";

// In development, Vite proxy rewrites /api → http://localhost:5000/api
// In production (Vercel), VITE_API_URL must point to the deployed server URL
// e.g. https://your-server.vercel.app
const baseURL = import.meta.env.VITE_API_URL || "";

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});

export default axiosInstance;
