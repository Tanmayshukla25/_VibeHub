import React, { useEffect, useState, useRef } from "react";
import instance from "../axiosConfig";
import { Heart, MessageCircle, Send } from "lucide-react";
import defaultPic from "../assets/Defalutpic.png";
import FollowersList from "./FollowersList";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { VscMute, VscUnmute } from "react-icons/vsc";

const ReelsComponent = () => {
  const [loggedUser, setLoggedUser] = useState(null);
  const [reels, setReels] = useState([]);

  const [activeComments, setActiveComments] = useState({});
  const [commentText, setCommentText] = useState("");

  const [openSendSheetFor, setOpenSendSheetFor] = useState(null);

  const videoRefs = useRef({});
  const [mutedMap, setMutedMap] = useState({});

  const navigate = useNavigate();

  // Fetch logged-in user
  useEffect(() => {
    const getUser = async () => {
      const res = await instance.get("/user/verifyToken", {
        withCredentials: true,
      });
      setLoggedUser(res.data.user);
    };
    getUser();
  }, []);

  const loggedUserId = loggedUser?._id;

  // Fetch video reels
  useEffect(() => {
    if (!loggedUserId) return;

    const fetchReels = async () => {
      const res = await instance.get("/post/all", { withCredentials: true });
      const videos = res.data.filter((p) => {
        const m = p.media?.[0];
        return (
          m &&
          (m.type?.startsWith("video") || /\.(mp4|webm|ogg)$/i.test(m.url))
        );
      });
      setReels(videos);
    };

    fetchReels();
  }, [loggedUserId]);

// Pause all videos on tab change or tab hidden
useEffect(() => {
  const handleVisibility = () => {
    if (document.hidden) {
      Object.values(videoRefs.current).forEach((v) => v?.pause());
    }
  };

  document.addEventListener("visibilitychange", handleVisibility);
  return () =>
    document.removeEventListener("visibilitychange", handleVisibility);
}, []);

  // Auto-play & auto-mute on scroll
// Auto detect current video & play only the visible one
// Play only the video that is most visible using IntersectionObserver
useEffect(() => {
  if (!reels.length) return;

  let observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;

        if (entry.isIntersecting && entry.intersectionRatio > 0.75) {
          // Play the video in view
          video.play().catch(() => {});
        } else {
          // Pause all others
          video.pause();
        }
      });
    },
    {
      threshold: [0.25, 0.5, 0.75, 1],
    }
  );

  // Observe every video
  reels.forEach((post) => {
    const vid = videoRefs.current[post._id];
    if (vid) observer.observe(vid);
  });

  return () => observer.disconnect();
}, [reels]);



  // Tap to play/pause
  const togglePlay = (postId) => {
    const vid = videoRefs.current[postId];
    if (vid.paused) vid.play();
    else vid.pause();
  };

  const handleLike = async (postId) => {
    setReels((prev) =>
      prev.map((p) =>
        p._id === postId
          ? {
              ...p,
              likes: p.likes.includes(loggedUserId)
                ? p.likes.filter((id) => id !== loggedUserId)
                : [...p.likes, loggedUserId],
            }
          : p
      )
    );

    await instance.post(
      `/post/like/${postId}`,
      { userId: loggedUserId },
      { withCredentials: true }
    );
  };

  const openComments = async (postId) => {
    const res = await instance.get(`/post/comments/${postId}`, {
      withCredentials: true,
    });
    setActiveComments((prev) => ({ ...prev, [postId]: res.data }));
    setOpenSendSheetFor(null);
  };

  const handleAddComment = async (postId) => {
    if (!commentText.trim()) return;

    await instance.post(
      `/post/comment/${postId}`,
      { text: commentText, userId: loggedUserId },
      { withCredentials: true }
    );

    setCommentText("");
    openComments(postId);
  };

  const handleShare = async (receiverId, postId) => {
    const res = await instance.post(
      "/conversation/send-post",
      { receiverId, postId },
      { withCredentials: true }
    );
    navigate(`/home/chat/${res.data.chatId}`);
  };

  return (
    <div className="w-full h-screen pt-10 md:pt-0 md:mb-0 mb-18 pb-10 overflow-y-scroll scrollbar-hide flex justify-center bg-[#fafafa]">
      <div className="pt-10 pb-32">
        {reels.map((post) => {
          const isLiked = post.likes.includes(loggedUserId);

          return (
            <div
              key={post._id}
              className="relative  mx-auto mb-10 bg-black rounded-xl shadow-xl overflow-hidden"
              style={{ width: "350px", height: "720px" }}
              onClick={() => togglePlay(post._id)}
            >
              {/* VIDEO */}
              <video
                ref={(el) => (videoRefs.current[post._id] = el)}
                src={post.media[0].url}
                className="w-full h-full object-cover"
                loop
                playsInline
                muted={mutedMap[post._id] ?? true}
              />

              {/* MUTE / UNMUTE BUTTON */}
              <button
                onClick={(e) => {
                  e.stopPropagation();

                  setMutedMap((prev) => {
                    const newMuted = !(prev[post._id] ?? true);
                    const next = { ...prev };

                    // Unmute this → mute all others
                    if (!newMuted) {
                      reels.forEach((p) => {
                        if (p._id !== post._id) next[p._id] = true;
                        const ov = videoRefs.current[p._id];
                        if (ov) ov.muted = true;
                      });
                    }

                    next[post._id] = newMuted;
                    const vid = videoRefs.current[post._id];
                    if (vid) vid.muted = newMuted;
                    return next;
                  });
                }}
                className="absolute bottom-4 right-8 bg-black/60 text-white p-2 rounded-full z-50"
              >
                {mutedMap[post._id] ? <VscMute size={22} /> : <VscUnmute size={22} />}
              </button>

              {/* RIGHT BUTTONS */}
              <div className="absolute right-4 bottom-40 flex flex-col items-center gap-4 z-20">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLike(post._id);
                  }}
                >
                  <Heart
                    size={34}
                    fill={isLiked ? "red" : "none"}
                    className={isLiked ? "text-red-500" : "text-white"}
                  />
                <p className="text-white">{post.likes.length}</p>
                </button>


                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openComments(post._id);
                  }}
                >
                  <MessageCircle size={34} className="text-white" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveComments({});
                    setOpenSendSheetFor(post._id);
                  }}
                >
                  <Send size={30} className="text-white" />
                </button>
              </div>

              {/* USER INFO */}
              <div className="absolute bottom-4 left-4 text-white pr-20">
                <div className="flex items-center gap-3 mb-2">
                  <img
                    src={post.author?.profilePic || defaultPic}
                    className="w-10 h-10 rounded-full"
                  />
                  <p className="font-semibold">{post.author?.username}</p>
                </div>
                <p className="text-sm">
                  <b>{post.author?.username}:</b> {post.caption}
                </p>
              </div>

              {/* COMMENTS */}
              {activeComments[post._id] && (
                <motion.div
                  initial={{ y: 200 }}
                  animate={{ y: 0 }}
                  exit={{ y: 200 }}
                  className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 z-[999] max-h-[60%] overflow-y-auto"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-semibold">Comments</h2>
                    <button
                      onClick={() =>
                        setActiveComments((prev) => ({
                          ...prev,
                          [post._id]: null,
                        }))
                      }
                    >
                      ✖
                    </button>
                  </div>

                  <div className="space-y-2 mb-2">
                    {activeComments[post._id].map((c) => (
                      <div key={c._id} className="flex gap-3">
                        <img
                          src={c.user?.profilePic || defaultPic}
                          className="w-9 h-9 rounded-full"
                        />
                        <div className="bg-gray-100 px-3 py-2 rounded-lg">
                          <p className="text-sm">
                            <b>{c.user.username}</b> {c.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 mt-3">
                    <input
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 px-3 py-2 bg-gray-200 rounded-full outline-none"
                    />
                    <button
                      onClick={() => handleAddComment(post._id)}
                      className="text-blue-600 font-semibold"
                    >
                      Post
                    </button>
                  </div>
                </motion.div>
              )}

              {/* SEND SHEET */}
              {openSendSheetFor === post._id && (
                <motion.div
                  initial={{ y: 200 }}
                  animate={{ y: 0 }}
                  exit={{ y: 200 }}
                  className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 z-[999] max-h-[60%] overflow-y-auto"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-semibold">Send to</h2>
                    <button onClick={() => setOpenSendSheetFor(null)}>✖</button>
                  </div>

                  <FollowersList
                    onSelect={(uid) => handleShare(uid, post._id)}
                  />
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReelsComponent;
