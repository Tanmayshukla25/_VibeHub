import axios from "axios";

const instance = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:5000" 
      : "https://vibehub-ybkv.onrender.com", 
  withCredentials: true,
  timeout: 600000, // 🔥 10 minutes timeout for large file uploads
  headers: {
    "Content-Type": "application/json",
  },
});

export default instance;
