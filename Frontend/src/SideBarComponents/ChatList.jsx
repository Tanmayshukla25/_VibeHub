import { useEffect, useState } from "react";
import instance from "../axiosConfig";
import defaultPic from "../assets/Defalutpic.png";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle, Search } from "lucide-react";

const ChatList = () => {
  const [conversations, setConversations] = useState([]);
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChats = async () => {
      const tokenRes = await instance.get("/user/verifyToken", {
        withCredentials: true,
      });
      const userId = tokenRes.data.user.id;
      const userRes = await instance.get(`/user/${userId}`, {
        withCredentials: true,
      });
      setUser(userRes.data.user);

      const chatRes = await instance.get(`/conversation/user/${userId}`);
      setConversations(chatRes.data);
    };
    fetchChats();
  }, []);

  const openChat = (id) => navigate(`/home/chat/${id}`);

  const filteredChats = conversations.filter((conv) => {
    const other = conv.participants.find((p) => p._id !== user?._id);
    return other?.username?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="h-screen bg-gradient-to-br from-[#E3F2FD] to-[#F8F9FA] flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between p-4 bg-[#719FB0] text-white shadow-md"
      >
        <h1 className="text-xl font-bold tracking-wide">Messages</h1>
        <MessageCircle size={24} className="opacity-90" />
      </motion.div>

      {/* Search Bar */}
      <div className="relative mx-4 mt-4 mb-2">
        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search by username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#719FB0] bg-white"
        />
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 mt-2">
        {filteredChats.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center mt-24 text-center text-gray-500"
          >
            <MessageCircle size={40} className="mb-3 text-[#719FB0]" />
            <p className="text-lg font-medium">No chats found</p>
            <p className="text-sm text-gray-400">
              Start a new conversation with your friends!
            </p>
          </motion.div>
        ) : (
          <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            {filteredChats.map((conv, index) => {
              const other = conv.participants.find((p) => p._id !== user?._id);
              const lastMsg = conv.messages.at(-1);

              return (
                <motion.div
                  key={conv._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => openChat(conv._id)}
                  className="group flex items-center justify-between p-3 rounded-2xl bg-white/90 shadow-sm border border-gray-100 hover:shadow-lg hover:bg-white transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={other?.profilePic || defaultPic}
                        alt="Profile"
                        className="w-12 h-12 rounded-full object-cover border border-[#719FB0]/40 group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border border-white"></span>
                    </div>

                    <div className="flex flex-col">
                      <h3 className="font-semibold text-gray-800 group-hover:text-[#719FB0] transition-colors">
                        {other?.username}
                      </h3>
                      <p className="text-gray-500 text-sm truncate max-w-[220px]">
                        {lastMsg
                          ? lastMsg.text.length > 28
                            ? lastMsg.text.slice(0, 28) + "..."
                            : lastMsg.text
                          : "No messages yet"}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-gray-400 text-right min-w-[60px]">
                    {new Date(conv.updatedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
