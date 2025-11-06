// import React, { useState, useEffect } from "react";
// import { UserPlus, UserCheck, Sparkles } from "lucide-react";
// import instance from "../axiosConfig";
// import defaultpic from "../assets/Defalutpic.png";

// const Explore = () => {
//   const [getAllUsers, setGetAllUsers] = useState([]);
//   const [followedUsers, setFollowedUsers] = useState([]);
//   const [loggedInUserId, setLoggedInUserId] = useState(null);

//   // Fetch logged-in user
//   useEffect(() => {
//     const fetchLoggedInUser = async () => {
//       try {
//         const res = await instance.get("/user/verifyToken", {
//           withCredentials: true,
//         });
//         setLoggedInUserId(res.data.user.id || res.data.user._id);
//       } catch (error) {
//         console.error("Error fetching logged-in user:", error);
//       }
//     };

//     fetchLoggedInUser();
//   }, []);

//   // Fetch all users
//   useEffect(() => {
//     const fetchAllUsers = async () => {
//       try {
//         const response = await instance.get("/user/all", {
//           withCredentials: true,
//         });
//         setGetAllUsers(response.data.users);
//       } catch (error) {
//         console.error("Error fetching users:", error);
//       }
//     };
//     fetchAllUsers();
//   }, []);

//   // Handle follow/unfollow
//   const handleFollow = (userId) => {
//     setFollowedUsers((prev) =>
//       prev.includes(userId)
//         ? prev.filter((id) => id !== userId)
//         : [...prev, userId]
//     );
//   };

//   const filteredUsers = getAllUsers.filter(
//     (user) => user._id !== loggedInUserId
//   );

//   const formatFollowers = (count) => {
//     if (!count) return "0";
//     if (count >= 1000) {
//       return (count / 1000).toFixed(1) + "K";
//     }
//     return count;
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
//       {/* Header Section */}
//       <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10 shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 py-4">
//           <div className="flex items-center gap-2">
//             <div className="bg-gradient-to-br from-[#4A7C8C] to-[#1D5464] p-2 rounded-lg shadow-md">
//               <Sparkles className="w-5 h-5 text-white" />
//             </div>
//             <div>
//               <h1 className="text-2xl font-bold text-slate-800">Discover People</h1>
//               <p className="text-slate-600 text-xs mt-0.5">Connect with amazing creators</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* User Cards Grid */}
//       <div className="max-w-7xl mx-auto px-4 py-6">
//         <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
//           {filteredUsers.length > 0 ? (
//             filteredUsers.map((user) => (
//               <div
//                 key={user._id}
//                 className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-slate-100 hover:border-[#4A7C8C]/30 hover:-translate-y-1"
//               >
//                 {/* Card Header with Gradient */}
//                 <div className="h-16 bg-gradient-to-br from-[#4A7C8C] to-[#1D5464] relative">
//                   <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
//                     <div className="relative">
//                       <img
//                         src={user.profilePic || defaultpic}
//                         alt={user.name}
//                         className="w-16 h-16 rounded-xl object-cover border-3 border-white shadow-lg"
//                       />
//                       <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Card Content */}
//                 <div className="pt-10 px-3 pb-3">
//                   <div className="mb-3 text-center">
//                     <h2 className="font-bold text-slate-800 text-sm mb-0.5 group-hover:text-[#1D5464] transition-colors truncate">
//                       {user.name}
//                     </h2>
//                     <p className="text-[#4A7C8C] text-xs font-medium mb-1.5 truncate">
//                       {user.username}
//                     </p>
//                     <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">
//                       {user.bio || "No bio available"}
//                     </p>
//                   </div>

//                   {/* Stats */}
                 

//                   {/* Follow Button */}
//                   <button
//                     onClick={() => handleFollow(user._id)}
//                     className={`w-full py-2 rounded-lg font-semibold text-xs transition-all duration-300 flex items-center justify-center gap-1.5 ${
//                       followedUsers.includes(user._id)
//                         ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
//                         : "bg-gradient-to-r from-[#4A7C8C] to-[#1D5464] text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
//                     }`}
//                   >
//                     {followedUsers.includes(user._id) ? (
//                       <>
//                         <UserCheck className="w-3.5 h-3.5" />
//                         Following
//                       </>
//                     ) : (
//                       <>
//                         <UserPlus className="w-3.5 h-3.5" />
//                         Follow
//                       </>
//                     )}
//                   </button>
//                 </div>
//               </div>
//             ))
//           ) : (
//             <div className="col-span-full flex flex-col items-center justify-center py-16">
//               <div className="bg-slate-100 rounded-full p-6 mb-4">
//                 <Sparkles className="w-12 h-12 text-slate-400" />
//               </div>
//               <p className="text-slate-500 text-lg font-medium">No users found</p>
//               <p className="text-slate-400 text-sm mt-2">Start exploring to find people</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Explore;


import React, { useState, useEffect } from "react";
import { UserPlus, UserCheck, Clock, Sparkles } from "lucide-react";
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

  // ✅ Fetch Follow Status for current user (optional optimization)
  useEffect(() => {
   const fetchFollowingData = async () => {
  try {
    const res = await instance.get("/user/verifyToken", { withCredentials: true });
    const followingIds = res.data.user.following || [];
    const statusObj = {};
    followingIds.forEach((id) => (statusObj[id] = "following"));
    setFollowStatus(statusObj);
  } catch (err) {
    console.log("Error fetching following data:", err);
  }
};

    if (loggedInUserId) fetchFollowingData();
  }, [loggedInUserId]);

  // ✅ Handle Follow (Send Request)
  const handleFollow = async (receiverId) => {
    try {
      setLoadingId(receiverId);

      if (followStatus[receiverId] === "following") {
        return; // Already following, prevent duplicate
      }

      // Send follow request to backend
      const res = await instance.post(`/follow/send/${receiverId}`, {}, { withCredentials: true });

      if (res.status === 200) {
        setFollowStatus((prev) => ({ ...prev, [receiverId]: "requested" }));
      }
    } catch (error) {
      console.error("Error sending follow request:", error);
    } finally {
      setLoadingId(null);
    }
  };

  // ✅ Format Followers Count (helper)
  const formatFollowers = (count) => {
    if (!count) return "0";
    if (count >= 1000) return (count / 1000).toFixed(1) + "K";
    return count;
  };

  // ✅ Filter Logged-in User
  const filteredUsers = getAllUsers.filter((user) => user._id !== loggedInUserId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-[#4A7C8C] to-[#1D5464] p-2 rounded-lg shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Discover People</h1>
              <p className="text-slate-600 text-xs mt-0.5">
                Connect with amazing creators
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* User Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div
                key={user._id}
                className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-slate-100 hover:border-[#4A7C8C]/30 hover:-translate-y-1"
              >
                {/* Card Header */}
                <div className="h-16 bg-gradient-to-br from-[#4A7C8C] to-[#1D5464] relative">
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                    <div className="relative">
                      <img
                        src={user.profilePic || defaultpic}
                        alt={user.name}
                        className="w-16 h-16 rounded-xl object-cover border-3 border-white shadow-lg"
                      />
                      <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="pt-10 px-3 pb-3">
                  <div className="mb-3 text-center">
                    <h2 className="font-bold text-slate-800 text-sm mb-0.5 group-hover:text-[#1D5464] transition-colors truncate">
                      {user.name}
                    </h2>
                    <p className="text-[#4A7C8C] text-xs font-medium mb-1.5 truncate">
                      @{user.username}
                    </p>
                    <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">
                      {user.bio || "No bio available"}
                    </p>
                  </div>

                  {/* Follow Button */}
                  <button
                    disabled={loadingId === user._id}
                    onClick={() => handleFollow(user._id)}
                    className={`w-full py-2 rounded-lg font-semibold text-xs transition-all duration-300 flex items-center justify-center gap-1.5 ${
                      followStatus[user._id] === "following"
                        ? "bg-slate-100 text-slate-700"
                        : followStatus[user._id] === "requested"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gradient-to-r from-[#4A7C8C] to-[#1D5464] text-white hover:shadow-lg hover:scale-[1.02]"
                    }`}
                  >
                    {loadingId === user._id ? (
                      <span className="animate-pulse text-slate-400">Processing...</span>
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
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16">
              <div className="bg-slate-100 rounded-full p-6 mb-4">
                <Sparkles className="w-12 h-12 text-slate-400" />
              </div>
              <p className="text-slate-500 text-lg font-medium">No users found</p>
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
