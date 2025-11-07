import React, { useEffect, useState, useContext } from "react";
import { ArrowLeft, UserCheck, UserPlus, Clock } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import instance from "../axiosConfig";
import defaultPic from "../assets/Defalutpic.png";
import { UserContext } from "../UserContext";

const Following = () => {
  const [following, setFollowing] = useState([]);
  const [followStatus, setFollowStatus] = useState({});
  const [loadingId, setLoadingId] = useState(null);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams(); // ✅ Detect if viewing another user's following
  const userCtx = useContext(UserContext);
  const globalFetchNotifications = userCtx?.fetchNotifications;

  // ✅ Fetch logged-in user
  useEffect(() => {
    const fetchLoggedInUser = async () => {
      try {
        const res = await instance.get("/user/verifyToken", {
          withCredentials: true,
        });
        setLoggedInUserId(res.data.user.id || res.data.user._id);
      } catch (error) {
        console.error("Error verifying token:", error);
      }
    };
    fetchLoggedInUser();
  }, []);

  // ✅ Fetch following list (self or other user)
  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const endpoint = id
          ? `/follow/${id}/following`
          : "/follow/me/following"; // 🔄 dynamic endpoint
        const { data } = await instance.get(endpoint, { withCredentials: true });
        setFollowing(data.following || []);
      } catch (error) {
        console.error("Error fetching following:", error);
      }
    };
    fetchFollowing();
  }, [id]);

  // ✅ Fetch follow status
  useEffect(() => {
    const fetchFollowStatus = async () => {
      try {
        const res = await instance.get("/follow/status", {
          withCredentials: true,
        });
        const { following = [], requested = [] } = res.data;
        const statusObj = {};
        following.forEach((uid) => (statusObj[uid] = "following"));
        requested.forEach((uid) => (statusObj[uid] = "requested"));
        setFollowStatus(statusObj);
        if (globalFetchNotifications) globalFetchNotifications();
      } catch (err) {
        console.error("Error fetching follow status:", err);
      }
    };
    fetchFollowStatus();
  }, []);

  // ✅ Handle Follow / Unfollow / Cancel Request
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
        <h2 className="text-xl font-semibold text-slate-800">
          {id ? "Following" : "Your Following"}
        </h2>
      </div>

      {/* Following List */}
      {following.length > 0 ? (
        <div className="space-y-4">
          {following.map((user) => (
            <div
              key={user._id}
              className="flex items-center justify-between bg-white p-3 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 border border-slate-100 transition-all cursor-pointer"
              onClick={() => navigate(`/home/checkprofile/${user._id}`)} // ✅ open CheckProfile
            >
              {/* Left side */}
              <div className="flex items-center gap-3">
                <img
                  src={user.profilePic || defaultPic}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover border border-slate-200 hover:ring-2 hover:ring-[#4A7C8C] transition"
                />
                <div>
                  <p className="font-semibold text-slate-800 hover:text-[#1D5464] transition-colors">
                    {user.name}
                  </p>
                  <p className="text-sm text-slate-500">@{user.username}</p>
                </div>
              </div>

              {/* Right side button */}
              {loggedInUserId !== user._id && (
                <button
                  disabled={loadingId === user._id}
                  onClick={(e) => {
                    e.stopPropagation(); // ✅ prevent navigating when button clicked
                    handleFollowAction(user._id);
                  }}
                  className={`px-4 py-1.5 rounded-full font-semibold text-xs transition-all flex items-center gap-1.5 ${
                    followStatus[user._id] === "following"
                      ? "bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-500"
                      : followStatus[user._id] === "requested"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gradient-to-r from-[#4A7C8C] to-[#1D5464] text-white hover:shadow-lg hover:scale-[1.03]"
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
        <div className="flex flex-col items-center justify-center mt-20 text-center">
          <img
            src={defaultPic}
            alt="No following"
            className="w-20 h-20 rounded-full mb-4 opacity-60"
          />
          <p className="text-slate-500 text-lg font-medium">
            {id
              ? "This user isn’t following anyone yet."
              : "You aren’t following anyone yet."}
          </p>
        </div>
      )}
    </div>
  );
};

export default Following;
