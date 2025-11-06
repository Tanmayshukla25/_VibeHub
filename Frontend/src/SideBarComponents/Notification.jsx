import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, BellRing } from "lucide-react";
import instance from "../axiosConfig";
import defaultpic from "../assets/Defalutpic.png";

const Notification = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(null);

  // ✅ Fetch all pending follow requests for the logged-in user
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await instance.get("/follow/notifications", {
          withCredentials: true,
        });
        setRequests(res.data.requests || []);
      } catch (err) {
        console.error("Error fetching follow requests:", err);
      }
    };
    fetchRequests();
  }, []);

  // ✅ Accept a follow request
  const handleAccept = async (requestId) => {
    try {
      setLoading(requestId);
      await instance.put(`/follow/accept/${requestId}`, {}, { withCredentials: true });

      // Remove this request from the list (UI update)
      setRequests((prev) => prev.filter((req) => req._id !== requestId));
    } catch (err) {
      console.error("Error accepting request:", err);
    } finally {
      setLoading(null);
    }
  };

  // ✅ Reject a follow request
  const handleReject = async (requestId) => {
    try {
      setLoading(requestId);
      await instance.put(`/follow/reject/${requestId}`, {}, { withCredentials: true });

      // Remove this request from the list
      setRequests((prev) => prev.filter((req) => req._id !== requestId));
    } catch (err) {
      console.error("Error rejecting request:", err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-[#4A7C8C] to-[#1D5464] p-2 rounded-lg shadow-md">
              <BellRing className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
              <p className="text-slate-600 text-xs mt-0.5">
                Manage your follow requests
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req._id}
                className="flex items-center justify-between bg-white rounded-xl shadow-md p-4 border border-slate-100 hover:shadow-lg transition-all"
              >
                {/* Sender Info */}
                <div className="flex items-center gap-3">
                  <img
                    src={req.sender?.profilePic || defaultpic}
                    alt={req.sender?.name}
                    className="w-12 h-12 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="font-semibold text-slate-800 text-sm">
                      {req.sender?.name}
                    </h3>
                    <p className="text-[#4A7C8C] text-xs">@{req.sender?.username}</p>
                    <p className="text-slate-500 text-xs mt-1">
                      sent you a follow request
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(req._id)}
                    disabled={loading === req._id}
                    className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(req._id)}
                    disabled={loading === req._id}
                    className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="bg-slate-100 rounded-full p-6 mb-4">
              <BellRing className="w-12 h-12 text-slate-400" />
            </div>
            <p className="text-slate-500 text-lg font-medium">
              No new notifications
            </p>
            <p className="text-slate-400 text-sm mt-2">
              Follow requests will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notification;
