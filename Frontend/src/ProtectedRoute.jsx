import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import instance from "./axiosConfig";

function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState(false);

  useEffect(() => {
    async function checkLogin() {
      try {
        const res = await instance.get("/user/verifyToken", { withCredentials: true });
        console.log("✅ User Authenticated:", res.data.user);
        setAuth(true);
      } catch (err) {
        console.log("❌ Not Logged In:", err.response?.data || err.message);
        setAuth(false);
      } finally {
        setLoading(false);
      }
    }

    checkLogin();
  }, []);

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return auth ? children : <Navigate to="/" replace />;
}

export default ProtectedRoute;
