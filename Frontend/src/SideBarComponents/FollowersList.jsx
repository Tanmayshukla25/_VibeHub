import { useEffect, useState } from "react";
import instance from "../axiosConfig";
import defaultPic from "../assets/Defalutpic.png";
import { FaCheckCircle } from "react-icons/fa";
import { Send } from "lucide-react";

const FollowersList = ({ onSelect }) => {
  const [followers, setFollowers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchFollowers = async () => {
      const res = await instance.get("/follow/me/followers", {
        withCredentials: true,
      });
      setFollowers(res.data.followers || []);
    };
    fetchFollowers();
  }, []);

  const handleSelectUser = (userId) => {
    setSelectedUser(userId);
  };

  return (
    <div className="grid grid-cols-4 gap-4 mt-1">
      {followers.map((u) => {
        const isSelected = selectedUser === u._id;

        return (
          <div
            key={u._id}
            onClick={() => handleSelectUser(u._id)}
            className="flex flex-col items-center cursor-pointer relative"
          >
            {/* Profile + Tick */}
            <div className="relative">
              <img
                src={u.profilePic || defaultPic}
                className={`w-14 h-14 rounded-full object-cover border transition-all ${
                  isSelected
                    ? "border-green-500 border-2 scale-105"
                    : "border-gray-300"
                }`}
              />

              {isSelected && (
                <FaCheckCircle
                  size={20}
                  className="text-green-500 absolute -bottom-1 -right-1 bg-white rounded-full"
                />
              )}
            </div>

            {/* Username */}
            <p className="text-[12px] mt-1 text-center line-clamp-1">
              {u.username}
            </p>

            {/* SEND BUTTON - Only for selected user */}
            {isSelected && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(u._id); // sends post immediately
                }}
                className="mt-2 flex items-center gap-1 bg-[#719FB0] text-white px-3 py-1 rounded-full text-xs shadow-md hover:bg-[#5b899a] transition"
              >
                <Send size={14} />
                Send
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FollowersList;
