import React, { useEffect, useState, useRef } from "react";
import {
  Heart,
  MessageCircle,
  Send,
  UserPlus,
  UserCheck,
  Clock,
  Plus,
  X,
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

const MusicPickerModal = ({ isOpen, onClose, onSelect }) => {
  const [query, setQuery] = useState("");
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchSongs = async () => {
    if (!query.trim()) return;
    try {
      setLoading(true);
      const res = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(
          query
        )}&entity=song&limit=100`
      );
      const data = await res.json();
      setSongs(data.results || []);
    } catch (err) {
      console.log("Song search error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99999] flex items-center justify-center px-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-md p-4"
        >
          {/* HEADER */}
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-lg">Select Music</h2>
            <button onClick={onClose}>
              <X size={22} />
            </button>
          </div>

          {/* SEARCH BAR */}
          <div className="flex items-center gap-2 mb-3">
            <input
              type="text"
              placeholder="Search songs (e.g. Arijit Singh)"
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchSongs()}
            />
            <button
              onClick={searchSongs}
              className="px-4 py-2 bg-pink-500 text-white rounded-lg"
            >
              Search
            </button>
          </div>

          {/* SONG LIST */}
          <div className="max-h-80 overflow-y-auto space-y-2">
            {loading && <p className="text-center text-gray-500">Searching…</p>}

            {!loading &&
              songs.map((s) => (
                <div
                  key={s.trackId}
                  onClick={() =>
                    onSelect({
                      songUrl: s.previewUrl,
                      songName: `${s.trackName} - ${s.artistName}`,
                    })
                  }
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
                >
                  <img
                    src={s.artworkUrl100}
                    className="w-12 h-12 rounded-lg"
                    alt=""
                  />
                  <div>
                    <p className="font-semibold text-sm">{s.trackName}</p>
                    <p className="text-xs text-gray-500">{s.artistName}</p>
                  </div>
                </div>
              ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ===================== Story Upload Modal =====================
const StoryUploadModal = ({ isOpen, onClose, onUploaded }) => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [songUrl, setSongUrl] = useState("");
  const [songName, setSongName] = useState("");
  const [uploading, setUploading] = useState(false);

  const [showMusicPicker, setShowMusicPicker] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setPreviewUrl(null);
      setSongUrl("");
      setSongName("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isVideo = file?.type?.startsWith("video");

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);

      const form = new FormData();
      form.append("media", file);
      if (songUrl) form.append("songUrl", songUrl);
      if (songName) form.append("songName", songName);

      console.log("📤 Uploading story with:", {
        file: file.name,
        songUrl: songUrl ? "yes" : "no",
        songName: songName || "none",
      });

      const response = await instance.post("/story/create", form, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      console.log("✅ Upload successful:", response.data);
      onUploaded && onUploaded();
      onClose();
    } catch (err) {
      console.error("❌ Upload error:", err);
      const errorMsg =
        err.response?.data?.details || err.message || "Upload failed";
      alert(`Story upload error: ${errorMsg}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl"
        >
          {/* HEADER */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-[#719FB0] text-white">
            <button onClick={onClose}>
              <X size={22} />
            </button>
            <h2 className="font-semibold">Create Story</h2>
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="bg-white text-pink-600 px-4 py-1 rounded-full flex items-center justify-center"
            >
              {uploading ? (
                <span className="w-5 h-5 border-2 border-pink-600 border-t-transparent rounded-full animate-spin"></span>
              ) : (
                "Share"
              )}
            </button>
          </div>

          {/* BODY */}
          <div className="p-4 space-y-4">
            {/* MEDIA PREVIEW */}
            <div className="rounded-xl border border-dashed flex items-center justify-center min-h-[180px]">
              {previewUrl ? (
                isVideo ? (
                  <video
                    src={previewUrl}
                    className="w-full rounded-lg"
                    controls
                  />
                ) : (
                  <img src={previewUrl} className="w-full rounded-lg" alt="" />
                )
              ) : (
                <p className="text-gray-500">Add image or video</p>
              )}
            </div>

            {/* FILE INPUT */}
            <label className="flex justify-center">
              <div className="px-4 py-2 bg-[#719FB0] text-white rounded-full cursor-pointer">
                Select from device
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*,video/*"
                onChange={handleFileChange}
              />
            </label>

            {/* 🎵 MUSIC SELECTOR */}
            <div className="space-y-1">
              <label className="text-xs font-semibold">Music (optional)</label>

              <div
                className="px-3 py-2 border rounded-lg bg-gray-100 text-sm cursor-pointer"
                onClick={() => setShowMusicPicker(true)}
              >
                {songName ? `🎵 ${songName}` : "Select music for your story"}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Music Picker */}
      <MusicPickerModal
        isOpen={showMusicPicker}
        onClose={() => setShowMusicPicker(false)}
        onSelect={(data) => {
          setSongUrl(data.songUrl);
          setSongName(data.songName);
          setShowMusicPicker(false);
        }}
      />
    </AnimatePresence>
  );
};

// ===================== Story Viewer (Fullscreen) =====================
const StoryViewer = ({ isOpen, onClose, storyGroups, startUserId }) => {
  const [userIndex, setUserIndex] = useState(0);
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0); // 0 - 100
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  const DURATION = 11000; // ms per story (image/video basic timer)

  // set initial user group
  useEffect(() => {
    if (!isOpen || !storyGroups || storyGroups.length === 0) return;
    const idx = storyGroups.findIndex((g) => g.user?._id === startUserId);
    setUserIndex(idx === -1 ? 0 : idx);
    setStoryIndex(0);
    setProgress(0);
  }, [isOpen, startUserId, storyGroups]);

  const currentGroup = storyGroups[userIndex] || null;
  const currentStories = currentGroup?.stories || [];
  const currentStory = currentStories[storyIndex] || null;

  // Auto progress
  useEffect(() => {
    if (!isOpen || !currentStory || paused) return;

    setProgress(0);
    const start = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / DURATION) * 100);
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(timerRef.current);
        handleNext();
      }
    }, 50);

    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, userIndex, storyIndex, paused, currentStory?._id]);

  if (!isOpen || !currentStory) return null;

  const handleNext = () => {
    if (!currentGroup) return;
    if (storyIndex < currentStories.length - 1) {
      setStoryIndex((prev) => prev + 1);
      setProgress(0);
      return;
    }
    if (userIndex < storyGroups.length - 1) {
      setUserIndex((prev) => prev + 1);
      setStoryIndex(0);
      setProgress(0);
      return;
    }
    onClose();
  };

  const handlePrev = () => {
    if (!currentGroup) return;
    if (storyIndex > 0) {
      setStoryIndex((prev) => prev - 1);
      setProgress(0);
      return;
    }
    if (userIndex > 0) {
      const prevUserIdx = userIndex - 1;
      const prevStories = storyGroups[prevUserIdx].stories;
      setUserIndex(prevUserIdx);
      setStoryIndex(prevStories.length - 1);
      setProgress(0);
      return;
    }
    // already at first story
  };

  const onPressStart = () => {
    setPaused(true);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const onPressEnd = () => {
    setPaused(false);
  };

  const mediaIsVideo = currentStory.mediaType === "video";

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-8 right-6 text-white bg-white/10 hover:bg-white/20 rounded-full p-2"
        >
          <X size={24} />
        </button>

        {/* Story content */}
        <div className="relative w-full max-w-sm h-full max-h-[90vh] flex flex-col">
          {/* Progress bars */}
          <div className="flex gap-1 px-3 pt-4 pb-2">
            {currentStories.map((s, idx) => (
              <div
                key={s._id}
                className="h-1 rounded-full bg-white/30 overflow-hidden flex-1"
              >
                <div
                  className="h-full bg-white"
                  style={{
                    width:
                      idx < storyIndex
                        ? "100%"
                        : idx === storyIndex
                        ? `${progress}%`
                        : "0%",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Header: user info */}
          <div className="flex items-center gap-3 px-3 pb-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-500 to-yellow-400 p-[2px]">
              <div className="w-full h-full rounded-full bg-black">
                <img
                  src={currentGroup.user?.profilePic || defaultPic}
                  className="w-full h-full rounded-full object-cover"
                  alt=""
                />
              </div>
            </div>
            <div>
              <p className="text-white text-sm font-semibold">
                {currentGroup.user?.username || "User"}
              </p>
              <p className="text-xs text-white/60">
                {new Date(currentStory.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {/* Media area */}
          <div
            className="relative flex-1 flex items-center justify-center px-3 pb-6"
            onMouseDown={onPressStart}
            onMouseUp={onPressEnd}
            onMouseLeave={onPressEnd}
            onTouchStart={onPressStart}
            onTouchEnd={onPressEnd}
          >
            {mediaIsVideo ? (
              <video
                src={currentStory.mediaUrl}
                className="w-full h-[400px] md:h-[580px] rounded-xl object-contain bg-black"
                autoPlay
                playsInline
                muted={false}
              />
            ) : (
              <img
                src={currentStory.mediaUrl}
                className="w-full h-full rounded-xl object-contain bg-black"
                alt=""
              />
            )}

            {/* tap zones */}
            <div className="absolute inset-0 flex">
              <div className="w-1/3 h-full" onClick={handlePrev}></div>
              <div className="w-2/3 h-full" onClick={handleNext}></div>
            </div>

            {/* Song chip */}
            {currentStory.songUrl && (
              <>
                <audio src={currentStory.songUrl} autoPlay loop />
                <div className="absolute bottom-8 left-6 bg-black/60 text-white px-3 py-1.5 rounded-full text-xs flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-pink-500 to-yellow-400 flex items-center justify-center text-[10px]">
                    ♪
                  </span>
                  <span className="truncate max-w-[160px]">
                    {currentStory.songName || "Story music"}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// ===================== MAIN FEED COMPONENT =====================
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

  // 🔥 STORIES STATE
  const [stories, setStories] = useState([]);
  const [storiesLoading, setStoriesLoading] = useState(false);
  const [showStoryUpload, setShowStoryUpload] = useState(false);
  const [storyViewerOpen, setStoryViewerOpen] = useState(false);
  const [storyViewerStartUserId, setStoryViewerStartUserId] = useState(null);

  useEffect(() => {
    const fetchLoggedUser = async () => {
      try {
        // fetch full profile (includes profilePic) from /user/me
        const res = await instance.get("/user/me", {
          withCredentials: true,
        });
        // backend returns { user }
        const user = res.data.user || res.data;
        setLoggedUser(user);
        console.log("Fetched logged user:", user);
      } catch (err) {
        console.log("User fetch failed:", err);
      }
    };
    fetchLoggedUser();
  }, []);

  // 🟣 Fetch posts
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

  // 🟣 Fetch follow status
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

  // 🟣 Fetch stories (you + following) from backend
  const fetchStories = async () => {
    if (!loggedUser) return;
    try {
      setStoriesLoading(true);
      const res = await instance.get("/story/feed", {
        withCredentials: true,
      });
      setStories(res.data || []);
    } catch (err) {
      console.log("Stories fetch error:", err);
    } finally {
      setStoriesLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, [loggedUser]);

  useEffect(() => {
    if (!selectedPost) return;
    const fresh = posts.find((p) => p._id === selectedPost._id);
    if (fresh) setSelectedPost(fresh);
  }, [posts, selectedPost]);

  // Pause all videos when tab hidden
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

  // Auto play/pause videos on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (openReel) return;

      const viewportHeight =
        window.innerHeight || document.documentElement.clientHeight;

      Object.entries(videoRefs.current).forEach(([postId, video]) => {
        if (!video) return;
        const rect = video.getBoundingClientRect();

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

  // Group stories by user for IG-style viewer
  const storyGroups = (() => {
    const grouped = {};
    stories.forEach((s) => {
      const u = s.user || {};
      const uid = u._id || String(u);
      if (!grouped[uid]) {
        grouped[uid] = { user: u, stories: [] };
      }
      grouped[uid].stories.push(s);
    });

    let arr = Object.values(grouped);

    // Sort each user's stories by createdAt
    arr = arr.map((g) => ({
      ...g,
      stories: g.stories.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      ),
    }));

    // Logged-in user first
    arr.sort((a, b) => {
      if (a.user?._id === loggedInUserId) return -1;
      if (b.user?._id === loggedInUserId) return 1;
      return 0;
    });

    return arr;
  })();

  const myStoryGroup = storyGroups.find((g) => g.user?._id === loggedInUserId);
  const hasMyStories = !!myStoryGroup;

  const handleOpenStoryViewerForUser = (userId) => {
    setStoryViewerStartUserId(userId);
    setStoryViewerOpen(true);
  };

  return (
    <>
      <div className="max-w-xl mx-auto py-18 md:py-6 space-y-6">
        {/* =================== STORIES ROW =================== */}
        <div className="px-2">
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar ">
            {/* Your story bubble */}
            <div className="flex flex-col items-center cursor-pointer">
              <div
                className="relative"
                onClick={() =>
                  hasMyStories
                    ? handleOpenStoryViewerForUser(loggedInUserId)
                    : setShowStoryUpload(true)
                }
              >
                <div
                  className={`w-16 h-16 rounded-full p-[2px] ${
                    hasMyStories
                      ? "bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-400"
                      : "bg-gray-300"
                  }`}
                >
                  <div className="w-full h-full rounded-full bg-white p-[2px]">
                    <img
                      src={
                        loggedUser?.profilePic ||
                        loggedUser?.profilepic ||
                        defaultPic
                      }
                      className="w-full h-full rounded-full object-cover"
                      alt="me"
                    />
                  </div>
                </div>

                {/* Plus icon overlay */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowStoryUpload(true);
                  }}
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center"
                >
                  <Plus size={14} className="text-white" />
                </button>
              </div>
              <p className="text-xs text-gray-700 mt-1">Your story</p>
            </div>

            {/* Other users' stories */}
            {storyGroups
              .filter((g) => g.user?._id !== loggedInUserId)
              .map((group) => (
                <div
                  key={group.user?._id}
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleOpenStoryViewerForUser(group.user?._id)}
                >
                  <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-400">
                    <div className="w-full h-full rounded-full bg-white p-[2px]">
                      <img
                        src={group.user?.profilePic || defaultPic}
                        className="w-full h-full rounded-full object-cover"
                        alt={group.user?.username}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-700 mt-1 max-w-[64px] truncate">
                    {group.user?.username || "user"}
                  </p>
                </div>
              ))}

            {storiesLoading && (
              <p className="text-xs text-gray-400">Loading stories...</p>
            )}
          </div>
        </div>

        {/* =================== POSTS FEED =================== */}
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
                        e.stopPropagation();

                        setMutedMap((prev) => {
                          const currentlyMuted = prev[post._id] ?? true;
                          const newMuted = !currentlyMuted;

                          const next = { ...prev };

                          if (!newMuted) {
                            // unmuting this post → mute all others
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
                    setPostToShare(post);
                    setOpenSendSheet(true);
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

              {/* SHARE POST SHEET (inside card) */}
              <AnimatePresence>
                {openSendSheet && postToShare?._id === post._id && (
                  <motion.div
                    initial={{ y: 150, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 150, opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="absolute bottom-0 left-0 w-full bg-white shadow-2xl rounded-t-3xl p-4 z-[999] border-t"
                  >
                    <div className="w-12 h-1.5 rounded-full bg-gray-300 mx-auto mb-4" />
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-lg font-semibold">Send to</h2>
                      <button onClick={() => setOpenSendSheet(false)}>✖</button>
                    </div>
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
      <ReelsViewerModal
        isOpen={openReel}
        onClose={() => {
          setOpenReel(false);
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

      {/* 💬 Floating Chat Button */}
      <button
        onClick={() => setOpenChatBox(true)}
        className="hidden md:flex group fixed bottom-6 right-6 bg-gradient-to-b from-[#06b6d4] via-[#2563eb] to-[#6366f1] shadow-xl rounded-full items-center transition-all duration-300 z-50 px-4 py-4"
      >
        <MessageCircle size={28} className="text-white" />
        <span className="max-w-0 group-hover:max-w-xs overflow-hidden text-white text-sm font-medium ml-2 transition-all duration-300 whitespace-nowrap">
          Message
        </span>
      </button>

      {/* Chat Drawer */}
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

      {/* 📤 Story Upload Modal */}
      <StoryUploadModal
        isOpen={showStoryUpload}
        onClose={() => setShowStoryUpload(false)}
        onUploaded={fetchStories}
      />

      {/* 👁️ Story Viewer */}
      <StoryViewer
        isOpen={storyViewerOpen}
        onClose={() => setStoryViewerOpen(false)}
        storyGroups={storyGroups}
        startUserId={storyViewerStartUserId || loggedInUserId}
      />
    </>
  );
};

export default FrontPage;
