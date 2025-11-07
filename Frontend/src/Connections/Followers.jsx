import React, { useEffect, useState, useContext } from "react";
import { ArrowLeft, UserPlus, UserCheck, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import instance from "../axiosConfig";
import defaultPic from "../assets/Defalutpic.png";
import { UserContext } from "../UserContext";

const Followers = () => {
  const [followers, setFollowers] = useState([]);
  const [followStatus, setFollowStatus] = useState({});
  const [loadingId, setLoadingId] = useState(null);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const navigate = useNavigate();
  const userCtx = useContext(UserContext);
  const globalFetchNotifications = userCtx?.fetchNotifications;

  // ✅ Get logged-in user info
  useEffect(() => {
    const fetchLoggedInUser = async () => {
      try {
        const res = await instance.get("/user/verifyToken", {
          withCredentials: true,
        });
        setLoggedInUserId(res.data.user.id || res.data.user._id);
      } catch (err) {
        console.error("Error verifying user:", err);
      }
    };
    fetchLoggedInUser();
  }, []);

  // ✅ Fetch followers
  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const { data } = await instance.get("/follow/me/followers", {
          withCredentials: true,
        });
        setFollowers(data.followers || []);
      } catch (error) {
        console.error("Error fetching followers:", error);
      }
    };
    fetchFollowers();
  }, []);

  // ✅ Fetch current follow status
  useEffect(() => {
    const fetchFollowStatus = async () => {
      try {
        const res = await instance.get("/follow/status", {
          withCredentials: true,
        });
        const { following = [], requested = [] } = res.data;
        const statusObj = {};
        following.forEach((id) => (statusObj[id] = "following"));
        requested.forEach((id) => (statusObj[id] = "requested"));
        setFollowStatus(statusObj);
        if (globalFetchNotifications) globalFetchNotifications();
      } catch (err) {
        console.error("Error fetching follow status:", err);
      }
    };
    fetchFollowStatus();
  }, []);

  // ✅ Follow / Unfollow / Cancel handler
  const handleFollowAction = async (receiverId) => {
    try {
      setLoadingId(receiverId);
      const currentStatus = followStatus[receiverId];

      if (currentStatus === "following") {
        await instance.delete(`/follow/unfollow/${receiverId}`, {
          withCredentials: true,
        });
        setFollowStatus((prev) => ({ ...prev, [receiverId]: null }));
      } else if (currentStatus === "requested") {
        await instance.delete(`/follow/cancel/${receiverId}`, {
          withCredentials: true,
        });
        setFollowStatus((prev) => ({ ...prev, [receiverId]: null }));
      } else {
        const res = await instance.post(
          `/follow/send/${receiverId}`,
          {},
          { withCredentials: true }
        );

        const msg = res.data.message;
        if (msg.includes("accepted") || msg.includes("mutual")) {
          setFollowStatus((prev) => ({ ...prev, [receiverId]: "following" }));
        } else {
          setFollowStatus((prev) => ({ ...prev, [receiverId]: "requested" }));
        }
      }

      if (globalFetchNotifications) globalFetchNotifications();
    } catch (err) {
      console.error("Error updating follow status:", err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-slate-200 transition"
        >
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </button>
        <h2 className="text-xl font-semibold text-slate-800">Followers</h2>
      </div>

      {/* Followers List */}
      {followers.length > 0 ? (
        <div className="space-y-4">
          {followers.map((user) => (
            <div
              key={user._id}
              className="flex items-center justify-between bg-white p-3 rounded-2xl shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center gap-3">
                <img
                  src={user.profilePic || defaultPic}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <p className="font-medium text-slate-800">{user.name}</p>
                  <p className="text-sm text-slate-500">@{user.username}</p>
                </div>
              </div>

              {/* Button */}
              {loggedInUserId !== user._id && (
                <button
                  disabled={loadingId === user._id}
                  onClick={() => handleFollowAction(user._id)}
                  className={`px-4 py-1.5 rounded-full font-semibold text-xs transition-all flex items-center gap-1.5 ${
                    followStatus[user._id] === "following"
                      ? "bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-500"
                      : followStatus[user._id] === "requested"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gradient-to-r from-[#4A7C8C] to-[#1D5464] text-white hover:shadow-lg hover:scale-[1.02]"
                  }`}
                >
                  {loadingId === user._id ? (
                    <span className="animate-pulse text-slate-400">
                      Processing...
                    </span>
                  ) : followStatus[user._id] === "following" ? (
                    <>
                      <UserCheck className="w-3.5 h-3.5" />
                      Following
                    </>
                  ) : followStatus[user._id] === "requested" ? (
                    <>
                      <Clock className="w-3.5 h-3.5" />
                      Requested
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      Follow
                    </>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-slate-500">
          You don’t have any followers yet.
        </p>
      )}
    </div>
  );
};

export default Followers;
