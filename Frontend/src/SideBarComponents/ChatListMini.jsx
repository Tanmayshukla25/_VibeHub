import { useEffect, useState } from "react";
import instance from "../axiosConfig";
import defaultPic from "../assets/Defalutpic.png";
import { useNavigate } from "react-router-dom";

const ChatListMini = () => {
  const [conversations, setConversations] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadChats = async () => {
      try {
        const tokenRes = await instance.get("/user/verifyToken", {
          withCredentials: true,
        });

        const userId = tokenRes.data.user.id;

        const userRes = await instance.get(`/user/${userId}`, {
          withCredentials: true,
        });

        setUser(userRes.data.user);

        const chatsRes = await instance.get(`/conversation/user/${userId}`, {
          withCredentials: true,
        });

        setConversations(chatsRes.data);
      } catch (error) {
        console.log("Chat load error:", error);
      }
    };

    loadChats();
  }, []);

  const openChat = (id) => navigate(`/home/chat/${id}`);

  return (
    <div className="overflow-y-auto h-[calc(100%-60px)] p-3 space-y-3">
      {conversations.length === 0 && (
        <p className="text-center text-gray-500 mt-10">No messages yet</p>
      )}

      {conversations.map((conv) => {
        const other = conv.participants?.find((p) => p._id !== user?._id);
        const last = conv.messages?.at(-1);

        return (
          <div
            key={conv._id}
            onClick={() => openChat(conv._id)}
            className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
          >
            <img
              src={other?.profilePic || defaultPic}
              className="w-10 h-10 rounded-full object-cover"
            />

            <div className="flex-1">
              <p className="font-semibold">{other?.username}</p>
              <p className="text-sm text-gray-500 truncate">
                {last?.text || "No messages yet"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatListMini;
