import React, { useState, useEffect } from "react";
import { UserPlus, UserCheck, Clock, UserX, Sparkles } from "lucide-react";
import instance from "../axiosConfig";
import defaultpic from "../assets/Defalutpic.png";

const Explore = () => {
  const [getAllUsers, setGetAllUsers] = useState([]);
  const [followStatus, setFollowStatus] = useState({});
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [loadingId, setLoadingId] = useState(null);

  // ✅ Fetch Logged-In User
  useEffect(() => {
    const fetchLoggedInUser = async () => {
      try {
        const res = await instance.get("/user/verifyToken", {
          withCredentials: true,
        });
        setLoggedInUserId(res.data.user.id || res.data.user._id);
      } catch (error) {
        console.error("Error fetching logged-in user:", error);
      }
    };
    fetchLoggedInUser();
  }, []);

  // ✅ Fetch All Users
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const response = await instance.get("/user/all", {
          withCredentials: true,
        });
        setGetAllUsers(response.data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchAllUsers();
  }, []);

  // ✅ Fetch Current Follow Status (persistent)
  useEffect(() => {
    const fetchFollowData = async () => {
      try {
        const res = await instance.get("/follow/status", {
          withCredentials: true,
        });
        // Backend should return something like:
        // { following: [...ids], requested: [...ids] }
        const { following = [], requested = [] } = res.data;
        const statusObj = {};

        following.forEach((id) => (statusObj[id] = "following"));
        requested.forEach((id) => (statusObj[id] = "requested"));

        setFollowStatus(statusObj);
      } catch (err) {
        console.log("Error fetching follow status:", err);
      }
    };
    if (loggedInUserId) fetchFollowData();
  }, [loggedInUserId]);

  // ✅ Handle Follow / Unfollow / Cancel
  const handleFollowAction = async (receiverId) => {
    try {
      setLoadingId(receiverId);
      const currentStatus = followStatus[receiverId];

      if (currentStatus === "following") {
        // 🔸 Unfollow
        await instance.delete(`/follow/unfollow/${receiverId}`, {
          withCredentials: true,
        });
        setFollowStatus((prev) => ({ ...prev, [receiverId]: null }));
      } else if (currentStatus === "requested") {
        // 🔸 Cancel follow request
        await instance.delete(`/follow/cancel/${receiverId}`, {
          withCredentials: true,
        });
        setFollowStatus((prev) => ({ ...prev, [receiverId]: null }));
      } else {
        // 🔹 Send new follow request
        await instance.post(
          `/follow/send/${receiverId}`,
          {},
          { withCredentials: true }
        );
        setFollowStatus((prev) => ({ ...prev, [receiverId]: "requested" }));
      }
    } catch (error) {
      console.error("Error updating follow status:", error);
    } finally {
      setLoadingId(null);
    }
  };

  // ✅ Filter Logged-in User
  const filteredUsers = getAllUsers.filter(
    (user) => user._id !== loggedInUserId
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-[#4A7C8C] to-[#1D5464] p-2 rounded-lg shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Discover People
              </h1>
              <p className="text-slate-600 text-xs mt-0.5">
                Connect with amazing creators
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div
                key={user._id}
                className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-slate-100 hover:border-[#4A7C8C]/30 hover:-translate-y-1"
              >
                {/* Header */}
                <div className="h-16 bg-gradient-to-br from-[#4A7C8C] to-[#1D5464] relative">
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                    <img
                      src={user.profilePic || defaultpic}
                      alt={user.name}
                      className="w-16 h-16 rounded-xl object-cover border-3 border-white shadow-lg"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="pt-10 px-3 pb-3 text-center">
                  <h2 className="font-bold text-slate-800 text-sm mb-0.5 truncate">
                    {user.name}
                  </h2>
                  <p className="text-[#4A7C8C] text-xs font-medium mb-1.5 truncate">
                    @{user.username}
                  </p>
                  <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed mb-3">
                    {user.bio || "No bio available"}
                  </p>

                  {/* Follow Button */}
                  <button
                    disabled={loadingId === user._id}
                    onClick={() => handleFollowAction(user._id)}
                    className={`w-full py-2 rounded-lg font-semibold text-xs transition-all duration-300 flex items-center justify-center gap-1.5 ${
                      followStatus[user._id] === "following"
                        ? "bg-slate-100 text-slate-700"
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
                        Unfollow
                      </>
                    ) : followStatus[user._id] === "requested" ? (
                      <>
                        <Clock className="w-3.5 h-3.5" />
                        Cancel Request
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        Follow
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16">
              <div className="bg-slate-100 rounded-full p-6 mb-4">
                <Sparkles className="w-12 h-12 text-slate-400" />
              </div>
              <p className="text-slate-500 text-lg font-medium">
                No users found
              </p>
              <p className="text-slate-400 text-sm mt-2">
                Start exploring to find people
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Explore;
