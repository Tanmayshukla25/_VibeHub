import React, { useState } from "react";
import { Heart, MessageCircle, Send, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import defaultPic from "../assets/Defalutpic.png";
import FollowersList from "./FollowersList";
import instance from "../axiosConfig";
import { useNavigate } from "react-router-dom";

const ReelsModal = ({
  isOpen,
  onClose,
  post,
  loggedUserId,
  loggedInUserId,
  handleToggleLike,
  openComments,
}) => {
  const navigate = useNavigate();
  const activeUserId = loggedInUserId || loggedUserId;

  const [openSendSheet, setOpenSendSheet] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !post) return null;

  const isLiked = post.likes?.includes(activeUserId);

  // SHARE HANDLER
  const handleSharePost = async (receiverId) => {
    try {
      setLoading(true);

      const res = await instance.post(
        "/conversation/send-post",
        {
          receiverId,
          postId: post._id,
        },
        { withCredentials: true }
      );

      const chatId = res.data.chatId;

      setOpenSendSheet(false);
      onClose();

      navigate(`/home/chat/${chatId}`);
    } catch (err) {
      console.log("Share post error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center"
    >
      {/* CLOSE BUTTON */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 z-100 text-white bg-white/20 backdrop-blur p-2 rounded-full"
      >
        <X size={28} />
      </button>

      {/* MAIN VIDEO */}
      <div className="relative h-full max-h-[90vh] w-full max-w-sm flex flex-col items-center">
        <video
          src={post.media[0].url}
          className="w-full h-full object-cover rounded-xl"
          autoPlay
          loop
          playsInline
        />

        {/* RIGHT ACTION BUTTONS */}
        <div className="absolute right-4 bottom-20 flex flex-col items-center gap-6">
          {/* LIKE */}
          <button onClick={() => handleToggleLike(post._id)}>
            <Heart
              size={34}
              fill={isLiked ? "red" : "none"}
              className={isLiked ? "text-red-500" : "text-white"}
            />
          </button>
          <p className="text-white text-sm">{post.likes?.length}</p>

          {/* COMMENT */}
          <button
            onClick={() => {
              onClose();
              openComments(post._id);
            }}
          >
            <MessageCircle size={34} className="text-white" />
          </button>

          {/* SHARE */}
          <button onClick={() => setOpenSendSheet(true)}>
            <Send size={30} className="text-white" />
          </button>
        </div>

        {/* BOTTOM USER INFO */}
        <div className="absolute bottom-4 left-4 right-20 text-white">
          <div className="flex items-center gap-3 mb-2">
            <img
              src={post.author?.profilePic || defaultPic}
              className="w-10 h-10 rounded-full object-cover"
            />
            <p className="font-semibold">{post.author?.username}</p>
          </div>

          <p className="text-sm opacity-90">
            <b>{post.author?.username}: </b> {post.caption}
          </p>
        </div>
      </div>

      {/* ⭐ SHARE POST BOTTOM SHEET (Same as FrontPage) */}
      <AnimatePresence>
        {openSendSheet && (
          <motion.div
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 200, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-0 left-0 right-0 
                bg-white rounded-t-3xl shadow-2xl p-4 
                z-[10000] border-t"
          >
            {/* drag bar */}
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4"></div>

            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">Send to</h2>
              <button onClick={() => setOpenSendSheet(false)}>✖</button>
            </div>

            {/* FOLLOWERS LIST */}
            <div className="max-h-64 overflow-y-auto">
              <FollowersList
                onSelect={(userId) => handleSharePost(userId)}
              />
            </div>

            {loading && (
              <p className="text-center py-2 text-sm text-gray-500">
                Sending...
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ReelsModal;
