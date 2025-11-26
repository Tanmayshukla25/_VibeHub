import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../socket";
import instance from "../axiosConfig";
import { Send, ArrowLeft, Loader2, X } from "lucide-react";
import defaultPic from "../assets/Defalutpic.png";
import { motion, AnimatePresence } from "framer-motion";
import { BsEmojiSmile } from "react-icons/bs";
import { HiGif } from "react-icons/hi2";
import EmojiPicker from "emoji-picker-react";
import axios from "axios";

const GIPHY_KEY = "OiO0hNStAtc63RzCpl56kMNhOs58tPrp";

const ChatRoom = () => {
  const { conversationId } = useParams();
  const [conversation, setConversation] = useState(null);
  const [user, setUser] = useState(null);
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [gifs, setGifs] = useState([]);
  const [gifSearch, setGifSearch] = useState("");
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const normalizeId = (id) => {
    if (!id) return "";
    if (typeof id === "object" && id._id) return String(id._id);
    return String(id);
  };

  // ✅ Fetch current user
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
        socket.emit("join_user", userId);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, []);

  // ✅ Fetch conversation
  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const res = await instance.get(`/conversation/${conversationId}`);
        setConversation(res.data);
      } catch (err) {
        console.error("Error fetching conversation:", err);
      }
    };
    if (conversationId) fetchConversation();
  }, [conversationId]);

  // ✅ Socket handling
  useEffect(() => {
    if (!conversationId) return;
    socket.emit("join_conversation", conversationId);

    const handleReceive = (message) => {
      if (message.conversationId !== conversationId) return;
      setConversation((prev) => {
        if (!prev) return { messages: [message], participants: [] };
        const exists = prev.messages?.some(
          (m) =>
            m._id === message._id ||
            (m.tempId && message.tempId && m.tempId === message.tempId)
        );
        if (exists) return prev;
        return { ...prev, messages: [...(prev.messages || []), message] };
      });
    };

    socket.on("receive_message", handleReceive);
    socket.on("receive_message_notification", handleReceive);

    return () => {
      socket.off("receive_message", handleReceive);
      socket.off("receive_message_notification", handleReceive);
    };
  }, [conversationId]);

  // ✅ Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

  // ✅ File preview handler
  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const cancelPreview = () => {
    setFile(null);
    setPreviewUrl(null);
  };

  // ✅ Fetch GIFs
  const fetchGifs = async (q = "trending") => {
    try {
      const query = q?.trim() || "trending";
      const url =
        query === "trending"
          ? `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_KEY}&limit=24&rating=g`
          : `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_KEY}&q=${encodeURIComponent(
              query
            )}&limit=24&rating=g&lang=en`;
      const res = await axios.get(url);
      setGifs(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch gifs:", err);
      setGifs([]);
    }
  };

  useEffect(() => {
    if (showGifPicker) fetchGifs("trending");
  }, [showGifPicker]);

  // ✅ Send message (text/gif/file)
  const handleSend = async (override = null) => {
    if (!user) return;
    if (!file && !override && !text.trim()) return;

    let content = override ?? text;
    let messageType = "text";
    let fileUrl = "";
    let fileType = "";
    let fileName = "";

    if (file) {
      try {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await axios.post(
          `${
            import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"
          }/upload/chatUpload`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        fileUrl = uploadRes.data.fileUrl || uploadRes.data.url;

        // FIX: Always choose correct fileType
        fileType = uploadRes.data.fileType || file.type;

        // FIX: Force correct message type
        messageType = file.type.startsWith("video")
          ? "video"
          : file.type.startsWith("image")
          ? "image"
          : "file";

        fileName = uploadRes.data.fileName;

        console.log(
          "UPLOAD RESPONSE:",
          uploadRes.data,
          "FILE TYPE USED:",
          fileType
        );
      } catch (err) {
        console.error("File upload failed:", err.response || err.message);
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    if (override?.startsWith("http")) messageType = "gif";

    const tempId = `temp-${Date.now()}`;
    const newMessage = {
      sender: user,
      text: content?.text || content,
      tempId,
      type: messageType,
      fileUrl,
      fileType,
      fileName,
      postId: content?.postId || null, // ⭐ POST SUPPORT ADDED
      createdAt: new Date().toISOString(),
      conversationId,
    };

    setConversation((prev) => ({
      ...prev,
      messages: [...(prev?.messages || []), newMessage],
    }));

    socket.emit("send_message", {
      conversationId,
      sender: user._id,
      text: content?.text || content,
      tempId,
      type: messageType,
      fileUrl,
      fileType,
      fileName,
      postId: content?.postId || null, // ⭐ SUPER IMPORTANT
    });

    setText("");
    setFile(null);
    setPreviewUrl(null);
    setShowGifPicker(false);
    setShowEmojiPicker(false);
  };

  return (
    <div className="flex flex-col min-h-screen pb-[100px] bg-white relative">
      {/* Header */}
      <div className="flex items-center justify-between p-1 bg-[#719FB0] text-white shadow-md fixed top-0 w-full sm:w-[84%] z-40">
        <div className="flex items-center gap-2">
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
                className={`md:max-w-[70%] px-4 py-2 rounded-2xl shadow-sm ${
                  isSender
                    ? "bg-[#719FB0] text-white ml-10"
                    : "bg-white border text-gray-800 mr-10"
                }`}
              >
                {msg.type === "gif" && (
                  <img
                    src={msg.text}
                    alt="gif"
                    className="w-30 md:w-56 md:h-56 object-cover rounded-lg"
                  />
                )}
                {msg.type === "image" && (
                  <img
                    src={msg.fileUrl}
                    alt="image"
                    className=" w-30 md:w-56 md:h-56 object-cover rounded-lg"
                  />
                )}
                {msg.type === "video" && (
                  <video controls className="w-30 md:w-56 md:h-56 rounded-lg">
                    <source src={msg.fileUrl} type={msg.fileType} />
                  </video>
                )}
                {msg.type === "file" && (
                  <a
                    href={msg.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-sm"
                  >
                    📎 {msg.fileName || "Download file"}
                  </a>
                )}
                {/* ⭐ SHARED POST MESSAGE BLOCK */}
                {msg.type === "post" && msg.postId && (
                  <div
                    className="w-30 md:w-56 h-30 md:h-56 bg-white rounded-xl shadow-md overflow-hidden border cursor-pointer"
                    onClick={() => navigate(`/home/${msg.postId._id}`)}
                  >
                    {msg.postId.media?.[0]?.type?.startsWith("video") ? (
                      <video
                        src={msg.postId.media?.[0]?.url}
                        className="w-30 md:w-56 md:h-56 object-cover"
                        controls
                        muted
                      />
                    ) : (
                      <img
                        src={msg.postId.media?.[0]?.url}
                        alt="shared post"
                        className="w-full h-48 object-cover"
                      />
                    )}

                    <div className="p-2">
                      <p className="text-sm text-gray-600 font-semibold">
                        {msg.postId.author?.username}
                      </p>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {msg.postId.caption}
                      </p>
                    </div>
                  </div>
                )}

                {msg.type === "text" && (
                  <p className="break-words leading-relaxed">{msg.text}</p>
                )}

                <p className="text-[10px] mt-1 text-right opacity-70">
                  {new Date(msg.createdAt || Date.now()).toLocaleTimeString(
                    [],
                    { hour: "2-digit", minute: "2-digit" }
                  )}
                </p>
              </div>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Preview Modal with Loader */}
      <AnimatePresence>
        {previewUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-[999]"
          >
            <div className="bg-white rounded-2xl shadow-xl p-4 w-[90%] max-w-sm relative flex flex-col items-center">
              <button
                onClick={cancelPreview}
                disabled={uploading}
                className="absolute top-2 right-2 text-gray-600 hover:text-red-500 disabled:opacity-50"
              >
                <X size={20} />
              </button>

              {!uploading && (
                <>
                  {file?.type?.startsWith("image") && (
                    <img
                      src={previewUrl}
                      alt="preview"
                      className="w-full rounded-lg mb-3"
                    />
                  )}
                  {file?.type?.startsWith("video") && (
                    <video
                      src={previewUrl}
                      controls
                      className="w-full rounded-lg mb-3"
                    />
                  )}
                  {!file?.type?.startsWith("image") &&
                    !file?.type?.startsWith("video") && (
                      <p className="text-center text-gray-700 mb-3">
                        📄 {file?.name}
                      </p>
                    )}
                </>
              )}

              {uploading && (
                <div className="flex flex-col items-center justify-center w-full h-48">
                  <Loader2
                    size={40}
                    className="animate-spin text-[#719FB0] mb-3"
                  />
                  <p className="text-gray-600 font-medium">Uploading...</p>
                </div>
              )}

              <button
                onClick={() => handleSend()}
                disabled={uploading}
                className={`w-full py-2 rounded-lg mt-2 transition-all ${
                  uploading
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-[#719FB0] text-white hover:bg-[#5b899a]"
                }`}
              >
                {uploading ? "Uploading..." : "Send"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Bar */}
      <div className="fixed md:bottom-0 bottom-3  w-full sm:w-[84%] z-100 bg-[#719FB0] py-2.5 px-1.5 sm:p-3 border-t border-gray-200">
        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-20 left-3 z-50">
            <EmojiPicker
              onEmojiClick={(emoji) => {
                setText((p) => p + emoji.emoji);
                setShowEmojiPicker(false);
              }}
            />
          </div>
        )}

        {/* GIF Picker */}
        {showGifPicker && (
          <div className="absolute bottom-20 left-3 z-50 bg-white rounded p-3 shadow-lg w-[90%] sm:w-[320px] max-h-[360px] overflow-auto">
            <div className="flex flex-col sm:flex-row gap-2 mb-2">
              <input
                value={gifSearch}
                onChange={(e) => setGifSearch(e.target.value)}
                placeholder="Search GIFs..."
                className="flex-1 border p-2 rounded text-sm"
                onKeyDown={(e) => e.key === "Enter" && fetchGifs(gifSearch)}
              />
              <button
                onClick={() => fetchGifs(gifSearch || "trending")}
                className="px-3 py-2 bg-[#719FB0] text-white rounded text-sm"
              >
                Search
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {gifs.map((g) => (
                <img
                  key={g.id}
                  src={g.images.fixed_height_small.url}
                  alt="gif"
                  className="w-full h-24 object-cover rounded cursor-pointer"
                  onClick={() => handleSend(g.images.fixed_height.url)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Message Input Section */}
        <div className="flex items-center  sm:gap-3">
          {/* Emoji */}
          <button
            onClick={() => setShowEmojiPicker((s) => !s)}
            className="md:p-2 rounded-full text-white hover:bg-[#5b899a] transition"
          >
            <BsEmojiSmile size={22} />
          </button>

          {/* File Upload */}
          <label className="cursor-pointer relative group">
            <div className="flex items-center justify-center md:p-2 p-1 rounded-full text-white transition-all duration-300 group-hover:rotate-45 group-hover:bg-[#5b899a]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 transition-transform duration-300 group-hover:scale-110"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21.44 11.05l-9.19 9.19a5 5 0 01-7.07-7.07l9.19-9.19a3 3 0 014.24 4.24l-9.19 9.19a1 1 0 01-1.41-1.41l8.13-8.13"
                />
              </svg>
            </div>
            <input
              type="file"
              accept="image/*,video/*,application/pdf"
              hidden
              onChange={handleFileSelect}
            />
          </label>

          {/* GIF Button */}
          <button
            onClick={() => setShowGifPicker((s) => !s)}
            className="md:p-2 mr-2 md:mr-1  rounded-full text-white hover:bg-[#5b899a] transition"
          >
            <HiGif size={22} />
          </button>

          {/* Message Input */}
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border rounded-[8px]  md:rounded-[10px] mr-1 bg-white focus:outline-none focus:ring-1 focus:ring-[#5b899a] text-sm sm:text-base"
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />

          {/* Send Button */}
          <button
            onClick={() => handleSend()}
            className="p-2 bg-[#5b899a] rounded-full text-white hover:bg-[#4a7583] transition disabled:opacity-70"
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
