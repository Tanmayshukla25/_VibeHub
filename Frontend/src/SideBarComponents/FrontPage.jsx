import React, { useEffect, useState } from "react";
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
import { motion } from "framer-motion";

const FrontPage = () => {
  // ⭐ ALL HOOKS AT TOP (Required by React)
  const [loggedUser, setLoggedUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followStatus, setFollowStatus] = useState({});
  const [loadingId, setLoadingId] = useState(null);
  const [doubleTapPostId, setDoubleTapPostId] = useState(null);
  const [activeComments, setActiveComments] = useState({});
  const [commentText, setCommentText] = useState("");

  // ⭐ 1) Fetch logged-in user FIRST
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

  // ⭐ 2) Fetch all posts AFTER user is loaded
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

  // ⭐ 3) Fetch follow status AFTER user is loaded
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

  // ⭐ NOW IT IS SAFE TO RETURN UI
  if (!loggedUser) {
    return <div className="text-center p-4">Loading...</div>;
  }

  const loggedInUserId = String(loggedUser._id);

  // ⭐ Follow Actions
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

  // ⭐ Like Post
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

  // ⭐ Double Tap Like
  const handleDoubleTap = (postId) => {
    setDoubleTapPostId(postId);
    setTimeout(() => setDoubleTapPostId(null), 650);
    handleToggleLike(postId);
  };

  // ⭐ Comments
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

  // ⭐ UI
  return (
    <div className="max-w-xl mx-auto py-6 space-y-6">
      {posts.map((post) => {
        const authorId = String(post.author?._id || "");
        const isOwnPost = loggedInUserId === authorId;

        return (
          <motion.div
            key={post._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden relative"
          >
            {/* ⭐ FOLLOW BUTTON (Hidden on own posts) */}
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

            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3">
              <img
                src={post.author?.profilePic || defaultPic}
                className="w-11 h-11 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-gray-900">
                  {post.author?.username}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Media */}
            <div
              className="relative bg-black"
              onClick={(e) => e.detail === 2 && handleDoubleTap(post._id)}
            >
              {doubleTapPostId === post._id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1.3, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 flex items-center justify-center z-20"
                >
                  <Heart size={120} className="text-white opacity-80" />
                </motion.div>
              )}

              {post.media[0]?.type === "video" ? (
                <video
                  className="w-full aspect-square object-cover"
                  src={post.media[0].url}
                  muted
                  autoPlay
                  loop
                />
              ) : (
                <img
                  className="w-full aspect-square object-cover"
                  src={post.media[0]?.url}
                />
              )}
            </div>

            {/* Bottom Buttons */}
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
              <Send size={26} className="ml-auto text-gray-700" />
            </div>

            {/* Likes */}
            <p className="px-4 font-semibold text-gray-800">
              {post.likes.length} likes
            </p>

            {/* Caption */}
            <p className="px-4 py-2 text-gray-800">
              <b>{post.author?.username}</b> {post.caption}
            </p>

            {/* Comments */}
            {activeComments[post._id] && (
              <div className="px-4 pb-4">
                <div className="space-y-2 mb-3">
                  {activeComments[post._id].map((c) => (
                    <div key={c._id} className="flex items-start gap-2">
                      <img
                        src={c.user?.profilePic || defaultPic}
                        className="w-8 h-8 rounded-full"
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
          </motion.div>
        );
      })}
    </div>
  );
};

export default FrontPage;
