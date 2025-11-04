import React, { useState, useEffect } from "react";
import instance from "../axiosConfig";
import defaultpic from "../assets/defaultpic.png";

const Explore = () => {
  const [getAllUsers, setGetAllUsers] = useState([]);
  const [followedUsers, setFollowedUsers] = useState([]);
  const [loggedInUserId, setLoggedInUserId] = useState(null);

 
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


  const handleFollow = (userId) => {
    setFollowedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };


  const filteredUsers = getAllUsers.filter((user) => user._id !== loggedInUserId);

  return (
    <div className="px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {filteredUsers.length > 0 ? (
        filteredUsers.map((user) => (
          <div
            key={user._id}
            className="bg-gray-200 overflow-hidden mt-5 shadow-md rounded-xl p-5 flex flex-col items-center text-center hover:shadow-lg transition-all duration-300"
          >
            <img
              src={user.profilePic || defaultpic}
              alt={user.username}
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
            />

            <h2 className="mt-3 font-semibold text-lg">{user.name}</h2>
            <p className="text-gray-500 text-sm">@{user.username}</p>
            <p className="text-gray-400 text-xs mt-1">{user.bio}</p>

            <button
              onClick={() => handleFollow(user._id)}
              className={`mt-4 px-5 py-2 rounded-full font-medium transition-all duration-300 ${
                followedUsers.includes(user._id)
                  ? "bg-gray-200 text-gray-800"
                  : "bg-blue-600 text-white hover:bg-blue-700"
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
  );
};

export default Explore;
