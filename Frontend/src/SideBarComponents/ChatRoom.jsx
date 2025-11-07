

import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../socket";
import instance from "../axiosConfig";
import { Send, ArrowLeft } from "lucide-react";
import defaultPic from "../assets/Defalutpic.png";
import { motion } from "framer-motion";

const ChatRoom = () => {
  const { conversationId } = useParams();
  const [conversation, setConversation] = useState(null);
  const [user, setUser] = useState(null);
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // ✅ Normalize IDs safely
  const normalizeId = (id) => {
    if (!id) return "";
    if (typeof id === "object" && id._id) return String(id._id);
    return String(id);
  };

  // ✅ Fetch current user and join personal socket room
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

        // ✅ Join user's personal socket room (for notifications)
        socket.emit("join_user", userId);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, []);

  // ✅ Fetch conversation messages
  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const res = await instance.get(`/conversation/${conversationId}`);
        setConversation(res.data);
      } catch (err) {
        console.error("Error fetching conversation:", err);
      }
    };
    fetchConversation();
  }, [conversationId]);

  // ✅ Join socket room for live updates
  useEffect(() => {
    if (!conversationId) return;

    // Join the specific conversation room
    socket.emit("join_conversation", conversationId);

    // When a message is received
    const handleReceive = (message) => {
      // ✅ Make sure the message belongs to this conversation
      if (message.conversationId !== conversationId) return;

      // ✅ Avoid duplicates
      setConversation((prev) => {
        if (!prev) return { messages: [message] };

        const exists = prev.messages?.some(
          (m) =>
            m._id === message._id ||
            (m.tempId && message.tempId && m.tempId === message.tempId)
        );
        if (exists) return prev;

        return {
          ...prev,
          messages: [...(prev.messages || []), message],
        };
      });
    };

    // ✅ Handle socket events
    socket.on("receive_message", handleReceive);
    socket.on("receive_message_notification", handleReceive); // for receiver not in chat

    return () => {
      socket.off("receive_message", handleReceive);
      socket.off("receive_message_notification", handleReceive);
    };
  }, [conversationId]);

  // ✅ Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

  // ✅ Send message logic
  const handleSend = () => {
    if (!text.trim() || !user) return;

    const tempId = `temp-${Date.now()}`;
    const newMessage = {
      sender: user,
      text,
      tempId,
      createdAt: new Date().toISOString(),
      conversationId, // add conversation context
    };

    // Instant UI update
    setConversation((prev) => ({
      ...prev,
      messages: [...(prev?.messages || []), newMessage],
    }));

    // Emit to server
    socket.emit("send_message", {
      conversationId,
      sender: user._id,
      text,
      tempId,
    });

    setText("");
  };

  return (
    <div className="flex flex-col min-h-screen pb-[80px] bg-white relative">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-[#719FB0] text-white shadow-md fixed top-0 w-full sm:w-[84%] z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1 rounded-full hover:bg-white/20"
          >
            <ArrowLeft size={22} />
          </button>

          {conversation?.participants
            ?.filter((p) => normalizeId(p._id) !== normalizeId(user?._id))
            .map((p) => (
              <div key={p._id} className="flex items-center gap-2">
                <img
                  src={p.profilePic || defaultPic}
                  alt="user"
                  className="w-10 h-10 rounded-full object-cover border border-white/40"
                />
                <span className="font-semibold text-lg">{p.username}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 mt-[60px] bg-gray-50 space-y-3">
        {conversation?.messages?.map((msg, i) => {
          const senderId = normalizeId(msg.sender?._id || msg.sender);
          const userId = normalizeId(user?._id);
          const isSender = senderId === userId;

          return (
            <motion.div
              key={msg._id || msg.tempId || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex items-end ${
                isSender ? "justify-end" : "justify-start"
              }`}
            >
              {!isSender && (
                <img
                  src={msg.sender?.profilePic || defaultPic}
                  alt="sender"
                  className="w-7 h-7 rounded-full object-cover mr-2"
                />
              )}

              <div
                className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-sm ${
                  isSender
                    ? "bg-[#719FB0] text-white ml-10"
                    : "bg-white border text-gray-800 mr-10"
                }`}
              >
                <p className="break-words leading-relaxed">{msg.text}</p>
                <p className="text-[10px] mt-1 text-right opacity-70">
                  {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input (fixed bottom) */}
      <div className="flex items-center p-3 border-t border-gray-200 bg-[#719FB0] fixed bottom-0 w-full sm:w-[84%] z-50">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border rounded-full bg-white focus:outline-none focus:ring-1 focus:ring-[#719FB0]"
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="ml-2 bg-[#719FB0] p-2 rounded-full text-white hover:bg-[#5b899a] transition-all"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
