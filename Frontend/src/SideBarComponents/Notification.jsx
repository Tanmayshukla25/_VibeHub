import React, { useEffect, useState } from "react";
import { UserPlus, Check, XCircle, Bell } from "lucide-react";
import instance from "../axiosConfig";
import defaultPic from "../assets/Defalutpic.png";

const Notifications = () => {
  const [requests, setRequests] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  const fetchRequests = async () => {
    try {
      const res = await instance.get("/follow/notifications", {
        withCredentials: true,
      });
      setRequests(res.data.requests || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (requestId) => {
    try {
      setLoadingId(requestId);
      await instance.put(`/follow/accept/${requestId}`, {}, { withCredentials: true });
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
      window.dispatchEvent(new Event("followUpdate"));
    } catch (error) {
      console.error("Error accepting request:", error);
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (requestId) => {
    try {
      setLoadingId(requestId);
      await instance.put(`/follow/reject/${requestId}`, {}, { withCredentials: true });
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
      window.dispatchEvent(new Event("followUpdate"));
    } catch (error) {
      console.error("Error rejecting request:", error);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f7ff] via-[#e7f3ff] to-[#f9fbff] flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/60 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center gap-3">
          <div className="bg-gradient-to-br from-[#1D5464] to-[#4A7C8C] p-2 rounded-xl shadow-md">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
            <p className="text-slate-500 text-sm">Manage your follow requests</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-grow max-w-5xl mx-auto w-full px-5 py-8">
        {requests.length > 0 ? (
          <div className="space-y-5">
            {requests.map((req) => (
              <div
                key={req._id}
                className="flex items-center justify-between bg-white/70 backdrop-blur-sm border border-slate-100 shadow-md hover:shadow-lg transition-all rounded-2xl p-4 group"
              >
                {/* Left Side - User Info */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={req.sender?.profilePic || defaultPic}
                      alt="profile"
                      className="w-14 h-14 rounded-full border border-slate-200 object-cover shadow-sm group-hover:scale-105 transition"
                    />
                    <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-base">
                      {req.sender?.name || "Unknown"}
                    </p>
                    <p className="text-sm text-slate-500">@{req.sender?.username}</p>
                    <p className="text-xs text-slate-400 mt-1">Sent you a follow request</p>
                  </div>
                </div>

                {/* Right Side - Buttons */}
                <div className="flex gap-2">
                  <button
                    disabled={loadingId === req._id}
                    onClick={() => handleAccept(req._id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm
                      ${
                        loadingId === req._id
                          ? "bg-green-400 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700 text-white"
                      }`}
                  >
                    <Check className="w-4 h-4" />
                    Accept
                  </button>
                  <button
                    disabled={loadingId === req._id}
                    onClick={() => handleReject(req._id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm
                      ${
                        loadingId === req._id
                          ? "bg-red-400 cursor-not-allowed"
                          : "bg-red-500 hover:bg-red-600 text-white"
                      }`}
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-md">
              <UserPlus className="w-12 h-12 text-[#1D5464] mx-auto mb-3" />
              <p className="text-lg font-semibold text-slate-700">No new follow requests</p>
              <p className="text-slate-500 text-sm mt-1">
                You’ll see new requests here when someone follows you.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
