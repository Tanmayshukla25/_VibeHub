import { useEffect, useState } from "react";
import instance from "../axiosConfig";
import defaultPic from "../assets/Defalutpic.png";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const MessagesPage = () => {
  const [followers, setFollowers] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // ✅ Fetch logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const tokenRes = await instance.get("/user/verifyToken", {
          withCredentials: true,
        });
        const userId = tokenRes.data.user.id;
        const userRes = await instance.get(`/user/${userId}`, {
          withCredentials: true,
        });
        setUser(userRes.data.user);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, []);

  // ✅ Fetch followers list
  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const res = await instance.get("/follow/me/followers", {
          withCredentials: true,
        });
        setFollowers(res.data.followers || []);
      } catch (err) {
        console.error("Error fetching followers:", err);
      }
    };
    fetchFollowers();
  }, []);

  // ✅ Start chat
//   const handleStartChat = async (receiverId) => {
//     if (!user?._id) {
//       console.warn("User not loaded yet");
//       return;
//     }

//     try {
//       const { data } = await instance.post(
//         "/conversation/start",
//         {
//           senderId: user._id,
//           receiverId: receiverId,
//         },
//         { withCredentials: true }
//       );

//       if (data?._id) {
//         navigate(`/home/chat/${data._id}`);
//       } else {
//         console.error("Conversation ID missing:", data);
//       }
//     } catch (err) {
//       console.error("❌ Error starting chat:", err);
//     }
//   };
const handleStartChat = async (receiverId) => {
  if (!user?._id) {
    console.warn("User not loaded yet");
    return;
  }

  try {
    const { data } = await instance.post(
      "/conversation/start",
      {
        senderId: user._id,
        receiverId: receiverId,
      },
      { withCredentials: true }
    );

    if (data?._id) {
      navigate(`/home/chat/${data._id}`);
    } else {
      console.error("Conversation ID missing:", data);
    }
  } catch (err) {
    console.error("❌ Error starting chat:", err);
  }
};

  return (
    <div className="w-full h-full bg-white flex flex-col p-4 overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Messages</h2>

      {followers.length === 0 ? (
        <p className="text-gray-500 text-sm text-center">No followers yet.</p>
      ) : (
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {followers.map((follower) => (
            <div
              key={follower._id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
            >
              <div className="flex items-center gap-3">
                <img
                  src={follower.profilePic || defaultPic}
                  alt="profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-800">
                    {follower.username}
                  </p>
                  <p className="text-sm text-gray-500">{follower.name}</p>
                </div>
              </div>

              <button
                onClick={() => handleStartChat(follower._id)}
                className="bg-[#719FB0] text-white text-sm px-3 py-1.5 rounded-lg hover:bg-[#5b899a] transition-all"
              >
                Let's Chat 💬
              </button>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default MessagesPage;
