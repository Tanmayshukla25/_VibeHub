import React, { useEffect, useState, useRef } from "react";
import {
  Heart,
  MessageCircle,
  Send,
  UserPlus,
  UserCheck,
  Clock,
} from "lucide-react";
import instance from "../axiosConfig";
import defaultPic from "../assets/Defalutpic.png";
import { AnimatePresence, motion } from "framer-motion";
import { FaRegBookmark } from "react-icons/fa6";
import ChatListMini from "./ChatListMini";
import ReelsViewerModal from "./ReelsViewerModal";
import { VscMute, VscUnmute } from "react-icons/vsc";
import { useNavigate } from "react-router-dom";
import FollowersList from "./FollowersList";

const FrontPage = () => {
  const [loggedUser, setLoggedUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followStatus, setFollowStatus] = useState({});
  const [loadingId, setLoadingId] = useState(null);
  const [doubleTapPostId, setDoubleTapPostId] = useState(null);
  const [activeComments, setActiveComments] = useState({});
  const [commentText, setCommentText] = useState("");
  const [openReel, setOpenReel] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [openChatBox, setOpenChatBox] = useState(false);
  const [mutedMap, setMutedMap] = useState({});
  const videoRefs = useRef({});
  const [openSendSheet, setOpenSendSheet] = useState(false);
  const [postToShare, setPostToShare] = useState(null);
const Navigate = useNavigate();
  useEffect(() => {
    const fetchLoggedUser = async () => {
      try {
        const res = await instance.get("/user/verifyToken", {
          withCredentials: true,
        });
        setLoggedUser(res.data.user);
      } catch (err) {
        console.log("User fetch failed:", err);
      }
    };
    fetchLoggedUser();
  }, []);

  useEffect(() => {
    if (!loggedUser) return;

    const fetchPosts = async () => {
      try {
        const res = await instance.get("/post/all", {
          withCredentials: true,
        });

        const normalized = res.data.map((p) => ({
          ...p,
          _id: String(p._id),
          author:
            typeof p.author === "string"
              ? { _id: p.author }
              : { ...p.author, _id: String(p.author._id) },
          likes: (p.likes || []).map((l) =>
            typeof l === "string" ? l : String(l._id)
          ),
          media: p.media || [],
        }));

        setPosts(normalized);
      } catch (err) {
        console.log("Posts fetch error:", err);
      }
    };

    fetchPosts();
  }, [loggedUser]);

  useEffect(() => {
    if (!loggedUser) return;

    const fetchStatus = async () => {
      try {
        const res = await instance.get("/follow/status", {
          withCredentials: true,
        });

        const map = {};
        (res.data.following || []).forEach((id) => (map[id] = "following"));
        (res.data.requested || []).forEach((id) => (map[id] = "requested"));

        setFollowStatus(map);
      } catch (err) {
        console.log("Follow status error:", err);
      }
    };

    fetchStatus();
  }, [loggedUser]);

  useEffect(() => {
    if (!selectedPost) return;
    const fresh = posts.find((p) => p._id === selectedPost._id);
    if (fresh) setSelectedPost(fresh);
  }, [posts, selectedPost]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        document.querySelectorAll(".feed-video").forEach((v) => {
          v.pause();
          v.muted = true;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (openReel) return;

      const viewportHeight =
        window.innerHeight || document.documentElement.clientHeight;

      Object.entries(videoRefs.current).forEach(([postId, video]) => {
        if (!video) return;
        const rect = video.getBoundingClientRect();

        // "Visible enough" area (25%–75% of screen height)
        const isVisible =
          rect.top < viewportHeight * 0.75 &&
          rect.bottom > viewportHeight * 0.25;

        if (isVisible) {
          const isMutedForPost = mutedMap[postId] ?? true;
          video.muted = isMutedForPost;
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    // initial call when component mounts / deps change
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [mutedMap, openReel]);

  if (!loggedUser) {
    return <div className="text-center p-4">Loading...</div>;
  }

  const loggedInUserId = String(loggedUser._id);

  const isVideo = (media) => {
    const type = media?.type || "";
    const url = media?.url || "";
    return (
      type.startsWith("video") ||
      type.includes("mp4") ||
      /\.(mp4|webm|ogg)$/i.test(url)
    );
  };

  const handleFollowAction = async (receiverId) => {
    try {
      setLoadingId(receiverId);
      const current = followStatus[receiverId];

      if (current === "following") {
        await instance.delete(`/follow/unfollow/${receiverId}`, {
          withCredentials: true,
        });
        setFollowStatus((p) => ({ ...p, [receiverId]: null }));
      } else if (current === "requested") {
        await instance.delete(`/follow/cancel/${receiverId}`, {
          withCredentials: true,
        });
        setFollowStatus((p) => ({ ...p, [receiverId]: null }));
      } else {
        const res = await instance.post(
          `/follow/send/${receiverId}`,
          {},
          { withCredentials: true }
        );

        if (res.data.message?.toLowerCase().includes("accepted")) {
          setFollowStatus((p) => ({ ...p, [receiverId]: "following" }));
        } else {
          setFollowStatus((p) => ({ ...p, [receiverId]: "requested" }));
        }
      }
    } catch (err) {
      console.log("Follow error:", err);
    } finally {
      setLoadingId(null);
    }
  };

  const handleToggleLike = async (postId) => {
    try {
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? {
                ...p,
                likes: p.likes.includes(loggedInUserId)
                  ? p.likes.filter((id) => id !== loggedInUserId)
                  : [...p.likes, loggedInUserId],
              }
            : p
        )
      );

      await instance.post(
        `/post/like/${postId}`,
        { userId: loggedInUserId },
        { withCredentials: true }
      );
    } catch (err) {
      console.log("Like error:", err);
    }
  };

  const handleDoubleTap = (postId) => {
    setDoubleTapPostId(postId);
    setTimeout(() => setDoubleTapPostId(null), 650);
    handleToggleLike(postId);
  };

  const openComments = async (postId) => {
    try {
      const res = await instance.get(`/post/comments/${postId}`, {
        withCredentials: true,
      });
      setActiveComments((p) => ({ ...p, [postId]: res.data }));
    } catch (err) {
      console.log(err);
    }
  };

  const handleAddComment = async (postId) => {
    if (!commentText.trim()) return;

    await instance.post(
      `/post/comment/${postId}`,
      { text: commentText, userId: loggedInUserId },
      { withCredentials: true }
    );

    openComments(postId);
    setCommentText("");
  };

  const handleMediaClick = (e, post) => {
    if (e.detail === 2) {
      handleDoubleTap(post._id);
      return;
    }

    const media = post.media?.[0];
    if (!isVideo(media)) return;

    document.querySelectorAll(".feed-video").forEach((v) => {
      v.pause();
      v.muted = true;
    });

    setSelectedPost(post);
    setOpenReel(true);
  };
  const handleSharePost = async (receiverId) => {
    try {
      const res = await instance.post(
        "/conversation/send-post",
        {
          receiverId,
          postId: postToShare._id,
        },
        { withCredentials: true }
      );

      const chatId = res.data.chatId;

      setOpenSendSheet(false);

      Navigate(`/home/chat/${chatId}`);
    } catch (err) {
      console.log("Share post error:", err);
    }
  };

  return (
    <>
      <div className="max-w-xl mx-auto py-20 md:py-6 space-y-6">
        {posts.map((post) => {
          const authorId = String(post.author?._id || "");
          const isOwnPost = loggedInUserId === authorId;
          const media = post.media[0];
          const isVideoPost = isVideo(media);
          const isMutedForPost = mutedMap[post._id] ?? true;

          return (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden relative"
            >
              {/* FOLLOW BUTTON */}
              {!isOwnPost && (
                <button
                  disabled={loadingId === authorId}
                  onClick={() => handleFollowAction(authorId)}
                  className="absolute top-3 right-4 px-3 py-1.5 text-xs bg-white border rounded-lg shadow-md font-semibold z-30 flex items-center gap-1 hover:bg-gray-100"
                >
                  {loadingId === authorId ? (
                    "..."
                  ) : followStatus[authorId] === "following" ? (
                    <>
                      <UserCheck size={13} /> Unfollow
                    </>
                  ) : followStatus[authorId] === "requested" ? (
                    <>
                      <Clock size={13} /> Requested
                    </>
                  ) : (
                    <>
                      <UserPlus size={13} /> Follow
                    </>
                  )}
                </button>
              )}

              {/* HEADER */}
              <div className="flex items-center gap-3 px-4 py-3">
                <img
                  src={post.author?.profilePic || defaultPic}
                  className="w-11 h-11 rounded-full object-cover"
                  alt=""
                />
                <div>
                  <p className="font-semibold">{post.author?.username}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* MEDIA */}
              <div
                className="relative bg-black"
                onClick={(e) => handleMediaClick(e, post)}
              >
                {/* double-tap heart animation */}
                {doubleTapPostId === post._id && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1.3, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 flex items-center justify-center z-20"
                  >
                    <svg
                      width="120"
                      height="120"
                      viewBox="0 0 24 24"
                      className="drop-shadow-2xl"
                    >
                      <defs>
                        <linearGradient
                          id="heartGradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <stop offset="0%" stopColor="#374151" />
                          <stop offset="50%" stopColor="#f43f5e" />
                          <stop offset="100%" stopColor="#fb923c" />
                        </linearGradient>
                      </defs>
                      <path
                        fill="url(#heartGradient)"
                        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 
                           2 5.42 4.42 3 7.5 3c1.74 0 3.41 1.01 4.5 2.09C13.09 4.01 
                           14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 
                           6.86-8.55 11.54L12 21.35z"
                      />
                    </svg>
                  </motion.div>
                )}

                {isVideoPost ? (
                  <div className="relative">
                    <video
                      ref={(el) => {
                        videoRefs.current[post._id] = el;
                      }}
                      data-postid={post._id}
                      className="feed-video w-full aspect-square object-cover"
                      loop
                      autoPlay
                      playsInline
                      muted={isMutedForPost}
                      src={media?.url}
                    />

                    {/* MUTE / UNMUTE BUTTON (per video) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // don’t open modal when clicking icon

                        setMutedMap((prev) => {
                          const currentlyMuted = prev[post._id] ?? true;
                          const newMuted = !currentlyMuted;

                          const next = { ...prev };

                          // if unmuting this post → mute all others
                          if (!newMuted) {
                            posts.forEach((p) => {
                              if (p._id !== post._id) {
                                next[p._id] = true;
                                const otherVideo = videoRefs.current[p._id];
                                if (otherVideo) {
                                  otherVideo.muted = true;
                                }
                              }
                            });
                          }

                          next[post._id] = newMuted;

                          const videoEl = videoRefs.current[post._id];
                          if (videoEl) {
                            videoEl.muted = newMuted;
                            if (!newMuted) {
                              videoEl.play().catch(() => {});
                            }
                          }

                          return next;
                        });
                      }}
                      className="absolute bottom-3 right-3 bg-black/60 text-white p-2 rounded-full"
                    >
                      {isMutedForPost ? (
                        <VscMute size={20} />
                      ) : (
                        <VscUnmute size={20} />
                      )}
                    </button>
                  </div>
                ) : (
                  <img
                    className="w-full aspect-square object-cover"
                    src={media?.url}
                    alt=""
                  />
                )}
              </div>

              {/* ACTION ROW */}
              <div className="flex items-center gap-5 px-4 py-3">
                <button onClick={() => handleToggleLike(post._id)}>
                  <Heart
                    size={28}
                    fill={post.likes.includes(loggedInUserId) ? "red" : "none"}
                    className={
                      post.likes.includes(loggedInUserId)
                        ? "text-red-500"
                        : "text-gray-700"
                    }
                  />
                </button>
                <button onClick={() => openComments(post._id)}>
                  <MessageCircle size={28} className="text-gray-700" />
                </button>
                <button
                  onClick={() => {
                    setPostToShare(post); // store which post you want to share
                    setOpenSendSheet(true); // open bottom sheet
                  }}
                >
                  <Send size={26} className="text-gray-700" />
                </button>

                <FaRegBookmark size={26} className="ml-auto text-gray-700" />
              </div>

              {/* LIKES + COMMENTS */}
              <p className="px-4 font-semibold text-gray-600 text-sm">
                {post.likes.length} likes
              </p>

              <p className="px-4 font-semibold text-gray-600 text-sm">
                {activeComments[post._id]?.length || post.comments?.length || 0}{" "}
                comments
              </p>

              {/* CAPTION */}
              <p className="px-4 py-2">
                <b>{post.author?.username}</b> {post.caption}
              </p>

              {/* COMMENTS SECTION */}
              {activeComments[post._id] && (
                <div className="px-4 pb-4">
                  <div className="space-y-2 mb-3">
                    {activeComments[post._id].map((c) => (
                      <div key={c._id} className="flex items-start gap-2">
                        <img
                          src={c.user?.profilePic || defaultPic}
                          className="w-8 h-8 rounded-full"
                          alt=""
                        />
                        <div className="bg-gray-100 px-3 py-2 rounded-xl">
                          <p className="text-sm">
                            <b>{c.user.username}</b> {c.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 px-3 py-2 bg-gray-100 rounded-full text-sm outline-none"
                    />
                    <button
                      onClick={() => handleAddComment(post._id)}
                      className={`text-blue-600 font-semibold ${
                        commentText.trim() ? "" : "opacity-40"
                      }`}
                    >
                      Post
                    </button>
                  </div>
                </div>
              )}
              <AnimatePresence>
                {openSendSheet && postToShare?._id === post._id && (
                  <motion.div
                    initial={{ y: 150, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 150, opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="
        absolute 
        bottom-0 left-0 
        w-full 
        bg-white 
        shadow-2xl 
        rounded-t-3xl 
        p-4 
        z-[999]
        border-t
      "
                  >
                    {/* top drag indicator */}
                    <div className="w-12 h-1.5 rounded-full bg-gray-300 mx-auto mb-4"></div>

                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-lg font-semibold">Send to</h2>
                      <button onClick={() => setOpenSendSheet(false)}>✖</button>
                    </div>

                    {/* followers list */}
                    <div className="max-h-56 overflow-y-auto">
                      <FollowersList
                        onSelect={(userId) => handleSharePost(userId)}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* 🎥 REELS MODAL */}
      {/* ⭐ SHARE POST BOTTOM SHEET */}

      {/* SEND POST BOTTOM SHEET — Appears inside the same post card */}

      <ReelsViewerModal
        isOpen={openReel}
        onClose={() => {
          setOpenReel(false);

          // re-run scroll handler logic so the correct video plays again
          setTimeout(() => {
            window.dispatchEvent(new Event("scroll"));
          }, 0);
        }}
        post={selectedPost}
        loggedInUserId={loggedInUserId}
        followStatus={followStatus}
        loadingId={loadingId}
        handleFollowAction={handleFollowAction}
        handleToggleLike={handleToggleLike}
        openComments={openComments}
      />

      {/* Floating Chat Button */}
      <button
        onClick={() => setOpenChatBox(true)}
        className=" hidden md:flex group fixed bottom-6 right-6 bg-gradient-to-b from-[#06b6d4] via-[#2563eb] to-[#6366f1] shadow-xl rounded-full  items-center transition-all duration-300 z-50 px-4 py-4"
      >
        <MessageCircle size={28} className="text-white" />
        <span className="max-w-0 group-hover:max-w-xs overflow-hidden text-white text-sm font-medium ml-2 transition-all duration-300 whitespace-nowrap">
          Message
        </span>
      </button>

      {/* Popup Chat Drawer */}
      {openChatBox && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-24 right-4 w-80 h-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50"
        >
          <div className="flex items-center justify-between p-4 bg-gray-100 rounded-t-2xl">
            <h2 className="font-bold text-lg">Messages</h2>
            <button onClick={() => setOpenChatBox(false)}>✖</button>
          </div>

          <ChatListMini />
        </motion.div>
      )}
    </>
  );
};

export default FrontPage;
