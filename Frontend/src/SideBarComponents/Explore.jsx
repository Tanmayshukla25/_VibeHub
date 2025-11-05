import React, { useState, useEffect } from "react";
import instance from "../axiosConfig";
import defaultpic from "../assets/Defaultpic.png";

const Explore = () => {
  const [getAllUsers, setGetAllUsers] = useState([]);
  const [followedUsers, setFollowedUsers] = useState([]);
  const [loggedInUserId, setLoggedInUserId] = useState(null);

  // Fetch logged-in user
  useEffect(() => {
    const fetchLoggedInUser = async () => {
      try {
        const res = await instance.get("/user/verifyToken", { withCredentials: true });
        setLoggedInUserId(res.data.user.id || res.data.user._id);
      } catch (error) {
        console.error("Error fetching logged-in user:", error);
      }
    };

    fetchLoggedInUser();
  }, []);

  // Fetch all users
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const response = await instance.get("/user/all", { withCredentials: true });
        setGetAllUsers(response.data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchAllUsers();
  }, []);

  // Handle follow/unfollow
  const handleFollow = (userId) => {
    setFollowedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const filteredUsers = getAllUsers.filter((user) => user._id !== loggedInUserId);

  return (
    <div className="px-6 py-4">
      {/* Header Section */}
      <div className="flex justify-center gap-6 mb-6">
        <button className="px-6 py-2 bg-gradient-to-r from-[#4ade80] to-[#14b8a6] text-white rounded-full shadow-md hover:opacity-90 transition-all">
          Followers
        </button>
        <button className="px-6 py-2 bg-gradient-to-r from-[#60a5fa] to-[#2563eb] text-white rounded-full shadow-md hover:opacity-90 transition-all">
          Following
        </button>
      </div>

      {/* User Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div
              key={user._id}
              className="bg-gradient-to-bl from-[#f9fafb] to-[#e0f2fe] p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex flex-col items-start"
            >
              {/* Top Row: Image + Info */}
              <div className="flex items-center gap-4 w-full">
                <img
                  src={user.profilePic || defaultpic}
                  alt={user.username}
                  className="w-14 h-14 rounded-full object-cover border-2 border-gray-300"
                />
                <div className="flex flex-col text-left">
                  <h2 className="font-semibold text-gray-800 text-base">
                    {user.name}
                  </h2>
                  <p className="text-gray-600 text-sm">{user.username}</p>
                  <p className="text-gray-500 text-xs line-clamp-2">
                    {user.bio || "No bio available"}
                  </p>
                </div>
              </div>

              {/* Follow Button */}
              <button
                onClick={() => handleFollow(user._id)}
                className={`mt-3 w-full py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                  followedUsers.includes(user._id)
                    ? "bg-gray-200 text-gray-800"
                    : "bg-gradient-to-r from-[#2dd4bf] to-[#1f2937] text-white hover:opacity-90"
                }`}
              >
                {followedUsers.includes(user._id) ? "Following" : "Follow"}
              </button>
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">No users found</p>
        )}
      </div>
    </div>
  );
};

export default Explore;
