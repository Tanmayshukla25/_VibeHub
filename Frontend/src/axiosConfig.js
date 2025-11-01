import axios from "axios";

const instance = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:5000" 
      : "https://vibehub-2gkt.onrender.com", 
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default instance;
