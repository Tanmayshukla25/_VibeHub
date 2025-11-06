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

      // 🔄 Refresh Sidebar notification count instantly
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-2">
          <div className="bg-gradient-to-br from-[#4A7C8C] to-[#1D5464] p-2 rounded-lg shadow-md">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
            <p className="text-slate-600 text-xs mt-0.5">Manage your follow requests here</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req._id}
                className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={req.sender?.profilePic || defaultPic}
                    alt="profile"
                    className="w-12 h-12 rounded-full border border-slate-200 object-cover"
                  />
                  <div>
                    <p className="font-semibold text-slate-800">{req.sender?.name || "Unknown"}</p>
                    <p className="text-sm text-slate-500">@{req.sender?.username}</p>
                    <p className="text-xs text-slate-400 mt-1">Sent you a follow request</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    disabled={loadingId === req._id}
                    onClick={() => handleAccept(req._id)}
                    className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                  >
                    <Check className="w-4 h-4" />
                    Accept
                  </button>
                  <button
                    disabled={loadingId === req._id}
                    onClick={() => handleReject(req._id)}
                    className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <UserPlus className="w-12 h-12 text-slate-400 mb-3" />
            <p className="text-slate-500 text-lg font-medium">No new follow requests</p>
            <p className="text-slate-400 text-sm mt-1">
              You’ll see new requests here when someone follows you.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
