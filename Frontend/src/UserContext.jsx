// ✅ src/UserContext.jsx
import React, { createContext, useState, useEffect } from "react";
import instance from "./axiosConfig";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [auth, setAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);

  // ✅ Verify token & fetch user
  useEffect(() => {
    const verifyUser = async () => {
      try {
        const res = await instance.get("/user/verifyToken", {
          withCredentials: true,
        });
        setAuth(true);
        setUser(res.data.user);
      } catch (err) {
        console.log("User not authenticated:", err);
        setAuth(false);
      }
    };
    verifyUser();
  }, []);

  
  const fetchNotifications = async () => {
    try {
      const res = await instance.get("/follow/notifications", {
        withCredentials: true,
      });
      setPendingCount(res.data.requests?.length || 0);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  // ✅ Auto-refresh notifications every 60s
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <UserContext.Provider
      value={{
        auth,
        setAuth,
        user,
        setUser,
        pendingCount,
        setPendingCount,
        fetchNotifications, 
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
