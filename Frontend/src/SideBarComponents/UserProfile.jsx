import React, { useContext, useEffect, useState } from "react";
import {
  Camera,
  Plus,
  X,
  Menu,
  CircleX,
  LogOut,
  Globe,
  Calendar,
  Lock,
  Unlock,
  Image as ImageIcon,
  Video as VideoIcon,
  Grid3x3,
  Bookmark,
  UserCircle,
  Settings,
  Heart,
  MessageCircle,
  Send,
  MoreVertical,
  Edit3,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Play, X as CloseIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import instance from "../axiosConfig";
import defaultPic from "../assets/Defalutpic.png";
import { UserContext } from "../UserContext";
import { Link, useNavigate } from "react-router-dom";

const UserProfile = () => {
  const { auth } = useContext(UserContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    username: "",
    email: "",
    bio: "",
    dob: "",
    website: "",
    isPrivate: false,
  });
  const navigate = useNavigate();

  // 🆕 Added Post System States
  const [showPostOptions, setShowPostOptions] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [postType, setPostType] = useState("image");
  const [caption, setCaption] = useState("");
  const [files, setFiles] = useState([]);
  const [previewFiles, setPreviewFiles] = useState([]);
  const [posts, setPosts] = useState([]);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [currentVideoSrc, setCurrentVideoSrc] = useState(null);
  const [doubleTapPostId, setDoubleTapPostId] = useState(null);

  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [activePostComments, setActivePostComments] = useState([]);
  const [currentCommentPostId, setCurrentCommentPostId] = useState(null);
  const [commentText, setCommentText] = useState("");

  const [activeTab, setActiveTab] = useState("posts");

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const tokenRes = await instance.get("/user/verifyToken", {
          withCredentials: true,
        });
        const userId = tokenRes.data.user.id;

        const userRes = await instance.get(`/user/${userId}`, {
          withCredentials: true,
        });
        setUser(userRes.data.user);

        // 🆕 Fetch user posts
        const postRes = await instance.get(`/post/user/${userId}`);
        setPosts(postRes.data);
      } catch (err) {
        console.error("Error fetching user details:", err);
        setError("Unable to load user data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProfilePic(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpdateProfilePic = async () => {
    if (!profilePic || !user?._id) return;

    const formData = new FormData();
    formData.append("profilePic", profilePic);

    try {
      setUploading(true);
      const response = await instance.put(
        `/user/update/${user._id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      setUser(response.data.user);
      setPreview(null);
      setProfilePic(null);
      setSuccess("Profile picture updated successfully!");
    } catch (err) {
      console.error("Error updating profile picture:", err);
      setError("Failed to update profile picture. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const openEditModal = () => {
    if (!user) return;
    setEditData({
      name: user.name || "",
      username: user.username || "",
      email: user.email || "",
      bio: user.bio || "",
      dob: user.dob ? user.dob.split("T")[0] : "",
      website: user.website || "",
      isPrivate: user.isPrivate || false,
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.entries(editData).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        formData.append(key, val);
      }
    });

    if (profilePic) formData.append("profilePic", profilePic);

    try {
      setUploading(true);
      const res = await instance.put(`/user/update/${user._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUser(res.data.user);
      setSuccess("Profile updated successfully!");
      setShowEditModal(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile.");
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await instance.post(
        "/user/logout",
        {},
        { withCredentials: true }
      );
      setSuccess(res.data.message || "Logout successful!");
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      setError("Logout failed. Try again.");
    }
  };

  // 🆕 Post Upload Handlers
  const handlePostFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);
    setPreviewFiles(selected.map((file) => URL.createObjectURL(file)));
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!files.length) return alert("Please select at least one file");

    const formData = new FormData();
    formData.append("caption", caption);
    formData.append("author", user._id);
    files.forEach((file) => formData.append("media", file));

    try {
      setUploading(true);
      const res = await instance.post("/post/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      setSuccess("Post created successfully!");
      setShowCreateModal(false);
      setFiles([]);
      setPreviewFiles([]);
      setCaption("");
      setPosts((prev) => [res.data.post, ...prev]);
    } catch (err) {
      console.error("Error creating post:", err);
      setError("Failed to create post.");
    } finally {
      setUploading(false);
    }
  };
  // LIKE / UNLIKE POST
  const handleToggleLike = async (postId) => {
    try {
      // Optimistic UI update
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? {
                ...p,
                likes: p.likes.some(
                  (id) => id === auth?._id || id?._id === auth?._id
                )
                  ? p.likes.filter(
                      (id) => !(id === auth?._id || id?._id === auth?._id)
                    )
                  : [...p.likes, auth?._id],
              }
            : p
        )
      );

      // Backend update
      await instance.post(
        `/post/like/${postId}`,
        { userId: user?._id },
        { withCredentials: true }
      );
      // 🔥 FIX: Fetch updated single post and update state correctly
      const updated = await instance.get(`/post/${postId}`);

      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? updated.data.post : p))
      );
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  // OPEN COMMENTS MODAL
  const openComments = async (postId) => {
    setCurrentCommentPostId(postId);
    setCommentModalOpen(true);

    try {
      const res = await instance.get(`/post/comments/${postId}`);
      setActivePostComments(res.data);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  // ADD COMMENT
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    await instance.post(
      `/post/comment/${currentCommentPostId}`,
      {
        text: commentText,
        userId: user?._id, // ✅ Correct place
      },
      {
        withCredentials: true,
      }
    );

    setCommentText("");

    const updated = await instance.get(
      `/post/comments/${currentCommentPostId}`
    );
    setActivePostComments(updated.data);
  };

  // OPEN VIDEO MODAL
  const openVideoModal = (url) => {
    setCurrentVideoSrc(url);
    setVideoModalOpen(true);
  };
  // DOUBLE TAP LIKE
  const handleDoubleTap = (postId) => {
    setDoubleTapPostId(postId);

    // Auto-hide heart animation
    setTimeout(() => setDoubleTapPostId(null), 600);

    // Perform like action
    handleToggleLike(postId);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );

  if (error || !user)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <p className="text-red-600 font-medium">
            {error || "User not found"}
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Floating Notification */}
      <AnimatePresence>
        {(success || error) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-2xl backdrop-blur-xl"
            style={{
              background: success
                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                : "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            }}
          >
            <p className="text-white font-semibold text-sm flex items-center gap-2">
              {success && <Sparkles size={16} />}
              {success || error}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal - Modern Glassmorphism */}
      <AnimatePresence>
        {showEditModal && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditModal(false)}
            />

            <motion.div
              className="fixed inset-0 flex justify-center items-center z-50 p-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-lg relative max-h-[90vh] overflow-y-auto border border-white/20">
                {/* Header with gradient */}
                <div className="sticky top-0 bg-[#719FB0] px-6 py-4 flex items-center justify-between rounded-t-3xl">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-white/80 hover:text-white transition"
                  >
                    <X size={24} />
                  </button>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Edit3 size={20} />
                    Edit Profile
                  </h2>
                  <button
                    onClick={handleUpdateProfile}
                    disabled={uploading}
                    className="text-white font-semibold disabled:opacity-50 hover:scale-105 transition"
                  >
                    {uploading ? "..." : "Save"}
                  </button>
                </div>

                <div className="p-6 space-y-5">
                  {/* Profile Picture with Ring */}
                  <div className="flex flex-col items-center py-4">
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-[#719FB0] rounded-full opacity-75 group-hover:opacity-100 blur transition"></div>
                      <img
                        src={preview || user?.profilePic || defaultPic}
                        alt="profile"
                        className="relative w-24 h-24 rounded-full object-cover ring-4 ring-white"
                      />
                    </div>
                    <label className="text-sm font-semibold bg-[#719FB0] bg-clip-text text-transparent mt-4 cursor-pointer hover:scale-105 transition">
                      Change Photo
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>

                  {/* Form Fields with Gradient Border */}
                  {[
                    {
                      label: "Name",
                      name: "name",
                      placeholder: "Your name",
                      icon: "👤",
                    },
                    {
                      label: "Username",
                      name: "username",
                      placeholder: "Username",
                      icon: "@",
                    },
                    {
                      label: "Email",
                      name: "email",
                      placeholder: "Email",
                      type: "email",
                      icon: "✉️",
                    },
                    {
                      label: "Website",
                      name: "website",
                      placeholder: "Your website",
                      icon: "🌐",
                    },
                    {
                      label: "Bio",
                      name: "bio",
                      placeholder: "Tell your story...",
                      multiline: true,
                      icon: "✨",
                    },
                  ].map((field) => (
                    <div key={field.name} className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <span>{field.icon}</span>
                        {field.label}
                      </label>
                      {field.multiline ? (
                        <textarea
                          name={field.name}
                          value={editData[field.name]}
                          onChange={handleEditChange}
                          placeholder={field.placeholder}
                          rows="3"
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-purple-400 focus:outline-none resize-none transition hover:border-gray-300"
                        />
                      ) : (
                        <input
                          type={field.type || "text"}
                          name={field.name}
                          value={editData[field.name]}
                          onChange={handleEditChange}
                          placeholder={field.placeholder}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-purple-400 focus:outline-none transition hover:border-gray-300"
                        />
                      )}
                    </div>
                  ))}

                  {/* Date of Birth */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <span>🎂</span>
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="dob"
                      value={editData.dob}
                      onChange={handleEditChange}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-purple-400 focus:outline-none transition hover:border-gray-300"
                    />
                  </div>

                  {/* Private Account Toggle - Modern */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Lock size={18} className="text-purple-600" />
                      <span className="text-sm font-semibold text-gray-800">
                        Private Account
                      </span>
                    </div>
                    <label className="relative inline-block w-14 h-8">
                      <input
                        type="checkbox"
                        name="isPrivate"
                        checked={editData.isPrivate}
                        onChange={handleEditChange}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-8 bg-gray-300 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-pink-600 peer-focus:outline-none transition-all shadow-inner">
                        <div className="absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-transform peer-checked:translate-x-6 shadow-md"></div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Menu - Glassmorphism */}
      <div className="fixed top-6 right-6 z-50 md:hidden">
        <button
          className="p-3 bg-white/90 backdrop-blur-xl rounded-full shadow-xl hover:scale-110 transition border border-white/20"
          onClick={() => setShowMenu((prev) => !prev)}
        >
          {showMenu ? (
            <X size={22} className="text-gray-700" />
          ) : (
            <Menu size={22} className="text-gray-700" />
          )}
        </button>

        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 mt-3 bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/20 py-2 w-52 overflow-hidden"
            >
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 w-full text-left transition text-gray-700 font-medium"
              >
                <LogOut size={20} className="text-red-500" />
                Log out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content Container */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Profile Card - Glassmorphism with Gradient */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 mb-8"
        >
          {/* Gradient Header */}
          <div className="h-40 bg-[#719FB0]  relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwdjJoLTYweiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMDUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-30"></div>
          </div>

          <div className="px-6 md:px-10 pb-8">
            {/* Profile Picture with Gradient Ring */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 -mt-16 relative z-10">
              <div className="relative group">
                {auth?._id === user?.id ? (
                  <label htmlFor="profilePic" className="cursor-pointer block">
                    <div className="absolute -inset-1 bg-[#719FB0] rounded-full opacity-75 group-hover:opacity-100 blur-sm transition"></div>
                    <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden ring-4 ring-white shadow-2xl">
                      <img
                        src={preview || user?.profilePic || defaultPic}
                        alt="profile"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <Camera className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <input
                      type="file"
                      id="profilePic"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                ) : (
                  <div>
                    <div className="absolute -inset-1 bg-[#719FB0] rounded-full opacity-75 blur-sm"></div>
                    <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden ring-4 ring-white shadow-2xl">
                      <img
                        src={user?.profilePic || defaultPic}
                        alt="profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left md:mt-20">
                <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 mb-4">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                    {user?.username}
                  </h1>
                  {auth?._id === user?.id && (
                    <div className="flex items-center justify-center md:justify-start gap-2">
                      <button
                        onClick={openEditModal}
                        className="px-6 py-2 bg-[#719FB0] text-white rounded-full text-sm font-semibold transition hover:scale-105 shadow-lg"
                      >
                        Edit Profile
                      </button>
                    </div>
                  )}
                </div>

                {/* Stats - Gradient Cards */}
                <div className="flex justify-center md:justify-start gap-6 mb-5">
                  <div className="text-center">
                    <div className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {posts.length}
                    </div>
                    <div className="text-xs md:text-sm text-gray-600 font-medium">
                      Posts
                    </div>
                  </div>
                  <Link
                    to="/home/followers"
                    className="text-center hover:scale-110 transition"
                  >
                    <div className="text-xl md:text-2xl font-bold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                      {user?.followers?.length || 0}
                    </div>
                    <div className="text-xs md:text-sm text-gray-600 font-medium">
                      Followers
                    </div>
                  </Link>
                  <Link
                    to="/home/following"
                    className="text-center hover:scale-110 transition"
                  >
                    <div className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {user?.following?.length || 0}
                    </div>
                    <div className="text-xs md:text-sm text-gray-600 font-medium">
                      Following
                    </div>
                  </Link>
                </div>

                {/* Bio */}
                <div className="text-sm text-gray-700 space-y-2 max-w-xl">
                  <p className="font-semibold text-gray-800">{user?.name}</p>
                  {user?.bio && (
                    <p className="whitespace-pre-line leading-relaxed">
                      {user.bio}
                    </p>
                  )}
                  <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 text-xs">
                    {user?.website && (
                      <a
                        href={user.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-purple-600 hover:text-pink-600 font-medium transition"
                      >
                        <Globe size={14} />
                        {user.website
                          .replace("https://", "")
                          .replace("http://", "")}
                      </a>
                    )}
                    {user?.dob && (
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Calendar size={14} />
                        {new Date(user.dob).toLocaleDateString()}
                      </div>
                    )}
                    {user?.isPrivate && (
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                        <Lock size={12} />
                        <span className="font-medium">Private</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Upload Profile Pic Button */}
            {preview && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleUpdateProfilePic}
                disabled={uploading}
                className="w-full mt-6 py-3 bg-[#719FB0] text-white rounded-full font-semibold transition hover:scale-105 shadow-lg disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "💾 Save Profile Picture"}
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Tabs - Modern Pill Design */}
        <div className="bg-white/80 backdrop-blur-xl rounded-full shadow-lg p-2 mb-8 border border-white/20 inline-flex mx-auto w-full md:w-auto justify-center">
          {[
            { id: "posts", icon: Grid3x3, label: "Posts" },
            { id: "saved", icon: Bookmark, label: "Saved" },
            { id: "tagged", icon: UserCircle, label: "Tagged" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition ${
                activeTab === tab.id
                  ? "bg-[#719FB0] text-white shadow-lg"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Create Post Button - Floating */}
        {activeTab === "posts" && auth?._id === user?.id && (
          <div className="flex justify-center mb-8">
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowPostOptions((prev) => !prev)}
                className="w-16 h-16 bg-[#719FB0] rounded-full flex items-center justify-center shadow-2xl hover:shadow-purple-500/50 transition"
              >
                <Plus size={32} className="text-white" />
              </motion.button>

              {/* Post Options Popup */}
              <AnimatePresence>
                {showPostOptions && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="absolute top-full mt-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-xl shadow-2xl border border-white/20 rounded-2xl overflow-hidden z-50 w-48"
                  >
                    <button
                      onClick={() => {
                        setPostType("image");
                        setShowPostOptions(false);
                        setShowCreateModal(true);
                      }}
                      className="flex items-center gap-3 px-5 py-3.5 w-full hover:bg-purple-50 text-gray-700"
                    >
                      <ImageIcon size={18} /> Image Post
                    </button>

                    <button
                      onClick={() => {
                        setPostType("video");
                        setShowPostOptions(false);
                        setShowCreateModal(true);
                      }}
                      className="flex items-center gap-3 px-5 py-3.5 w-full hover:bg-pink-50 text-gray-700"
                    >
                      <VideoIcon size={18} /> Video Post
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Create Post Modal - Modern */}
        {/* <AnimatePresence>
          {showCreateModal && (
            <>
              <motion.div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowCreateModal(false)}
              />
              <motion.div
                className="fixed inset-0 flex justify-center items-center z-50 p-4"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md relative max-h-[90vh] overflow-y-auto border border-white/20">
                  <div className="sticky top-0 bg-[#719FB0] px-6 py-4 flex items-center justify-between rounded-t-3xl">
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="text-white/80 hover:text-white transition"
                    >
                      <X size={24} />
                    </button>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Plus size={20} />
                      Create {postType === "video" ? "Video" : "Image"} Post
                    </h2>
                    <button
                      onClick={handleCreatePost}
                      disabled={uploading}
                      className="text-white font-semibold disabled:opacity-50 hover:scale-105 transition"
                    >
                      {uploading ? "..." : "Post"}
                    </button>
                  </div>
                  <div className="p-6 space-y-5">
                    <textarea
                      placeholder="Write a caption..."
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      rows="3"
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-purple-400 focus:outline-none resize-none transition hover:border-gray-300"
                    />
                    <input
                      type="file"
                      multiple
                      accept={
                        postType === "video"
                          ? "video/*"
                          : "image/*,image/jpeg,image/png"
                      }
                      onChange={handlePostFileChange}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-purple-400 focus:outline-none transition hover:border-gray-300"
                    />
                    {previewFiles.length > 0 && (
                      <div className="grid grid-cols-3 gap-3">
                        {previewFiles.map((src, i) =>
                          postType === "video" ? (
                            <video
                              key={i}
                              src={src}
                              className="w-full h-24 rounded-lg object-cover"
                              controls
                            />
                          ) : (
                            <img
                              key={i}
                              src={src}
                              alt="preview"
                              className="w-full h-24 object-cover rounded-lg"
                            />
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence> */}
        {/* Create Post Button - Floating */}
        {activeTab === "posts" && auth?._id === user?._id && (
          <div className="flex justify-center mb-8">
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowPostOptions((prev) => !prev)}
                className="w-16 h-16 bg-[#719FB0] rounded-full flex items-center justify-center shadow-2xl hover:shadow-purple-500/50 transition"
              >
                <Plus size={32} className="text-white" />
              </motion.button>

              {/* Post Options Popup */}
              <AnimatePresence>
                {showPostOptions && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="absolute top-full mt-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-xl shadow-2xl border border-white/20 rounded-2xl overflow-hidden z-50 w-48"
                  >
                    <button
                      onClick={() => {
                        setPostType("image");
                        setShowPostOptions(false);
                        setShowCreateModal(true);
                      }}
                      className="flex items-center gap-3 px-5 py-3.5 w-full hover:bg-purple-50 text-gray-700"
                    >
                      <ImageIcon size={18} /> Image Post
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Create Post Modal - Instagram Style (Images Only) */}
        <AnimatePresence>
          {showCreateModal && (
            <>
              <motion.div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowCreateModal(false)}
              />
              <motion.div
                className="fixed bottom-0 left-0 right-0 z-50 md:inset-0 md:flex md:items-center md:justify-center p-0 md:p-4"
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 500 }}
              >
                <div className="bg-white rounded-t-3xl md:rounded-3xl shadow-2xl w-full max-h-[90vh] md:max-w-md overflow-hidden flex flex-col">
                  {/* Header - Instagram Style */}
                  <div className="bg-[#1D5464] px-4 py-3 flex items-center justify-between border-b border-gray-200">
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="p-1 rounded-full hover:bg-white/10 transition"
                    >
                      <X size={24} className="text-white" />
                    </button>
                    <h2 className="text-base font-semibold text-white">
                      New Post
                    </h2>
                    <button
                      onClick={handleCreatePost}
                      disabled={uploading || files.length === 0}
                      className="flex items-center justify-center text-gray-100 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80 transition text-sm px-4 py-2 rounded-full min-w-[60px]"
                    >
                      {uploading ? (
                        <Loader2 className="animate-spin h-4 w-4" />
                      ) : (
                        "Share"
                      )}
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Media Preview - Grid for Multiple */}
                    {previewFiles.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {previewFiles.map((src, i) => (
                          <div
                            key={i}
                            className="relative rounded-lg overflow-hidden bg-gray-100 aspect-square"
                          >
                            <img
                              src={src}
                              alt={`Preview ${i + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {i === files.length - 1 && files.length > 9 && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-sm font-bold">
                                +{files.length - 9}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      // No media selected - Placeholder like IG
                      <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                          <ImageIcon size={24} className="text-gray-500" />
                        </div>
                        <p className="text-gray-500 font-medium mb-1">
                          Select Photos to Post
                        </p>
                        <p className="text-sm text-gray-400 mb-4">
                          Tap to add photos
                        </p>
                        <label className="bg-[#3897f0] text-white px-6 py-2 rounded-full text-sm font-semibold cursor-pointer hover:opacity-90 transition">
                          Select from Gallery
                          <input
                            type="file"
                            multiple
                            accept="image/*,image/jpeg,image/png"
                            onChange={handlePostFileChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}

                    {/* Caption Input - Instagram Style */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Caption
                      </label>
                      <textarea
                        placeholder="Write a caption..."
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        rows="3"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-[#3897f0] focus:outline-none resize-none transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
        {/* Posts Grid - Masonry Style */}

        {/* Saved Tab Empty State */}
        {activeTab === "saved" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-20 text-center"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
              <Bookmark size={40} className="text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Save Your Favorites
            </h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              Bookmark posts you love and find them here anytime
            </p>
          </motion.div>
        )}

        {/* Tagged Tab Empty State */}
        {activeTab === "tagged" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-20 text-center"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
              <UserCircle size={40} className="text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Photos of You
            </h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              When people tag you in photos, they'll appear here
            </p>
          </motion.div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.length === 0 && activeTab === "posts" && (
            <div className="col-span-full py-20 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                <Grid3x3 size={32} className="text-purple-400" />
              </div>
              <p className="text-gray-500 font-medium">No posts yet</p>
              <p className="text-gray-400 text-sm mt-1">
                Start sharing your moments
              </p>
            </div>
          )}

          {activeTab === "posts" &&
            posts.map((post, idx) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all hover:scale-[1.02]"
              >
                {/* Media (Image or Video) */}
                {/* Media (Image or Video) */}
                <div
                  className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 relative overflow-hidden cursor-pointer"
                  onClick={(e) => {
                    // Detect double tap
                    if (e.detail === 2) {
                      handleDoubleTap(post._id);
                      return;
                    }

                    // Single tap for video
                    if (post.media[0].type === "video") {
                      openVideoModal(post.media[0].url);
                    }
                  }}
                >
                  {/* Double Tap Heart */}
                  {doubleTapPostId === post._id && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1.5, opacity: 1 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0 flex items-center justify-center z-30"
                    >
                      <Heart
                        size={100}
                        className="text-red-500 drop-shadow-2xl"
                        fill="red"
                      />
                    </motion.div>
                  )}

                  {/* Media */}
                  {post.media[0].type === "video" ? (
                    <video
                      src={post.media[0].url}
                      className="w-full h-full object-cover"
                      muted
                    />
                  ) : (
                    <img
                      src={post.media[0].url}
                      alt="post"
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Hover Overlay */}
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent 
    opacity-0 group-hover:opacity-100 transition flex flex-col justify-end p-4"
                  >
                    <div className="flex items-center gap-4 text-white text-sm font-semibold mb-2">
                      <div className="flex items-center gap-1.5">
                        <Heart size={18} fill="white" />
                        <span>{post.likes?.length || 0}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MessageCircle size={18} />
                        <span>{post.comments?.length || 0}</span>
                      </div>
                    </div>

                    {post.caption && (
                      <p className="text-white/90 text-xs line-clamp-2">
                        {post.caption}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer (Caption + Date + Like/Comment Buttons) */}
                <div className="p-3 flex items-start justify-between gap-3">
                  <div className="flex-1">
                    {post.caption && (
                      <p className="text-gray-700 text-sm line-clamp-2">
                        {post.caption}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1.5">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex flex-col items-center gap-2 ml-3">
                    {/* LIKE BUTTON */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleLike(post._id);
                      }}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 transition"
                    >
                      <Heart
                        size={18}
                        fill={
                          post.likes.some(
                            (id) => id === auth?._id || id?._id === auth?._id
                          )
                            ? "red"
                            : "none"
                        }
                        className={
                          post.likes.some(
                            (id) => id === auth?._id || id?._id === auth?._id
                          )
                            ? "text-red-500"
                            : "text-gray-700"
                        }
                      />

                      <span className="text-xs">{post.likes?.length || 0}</span>
                    </button>

                    {/* COMMENT BUTTON */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openComments(post._id);
                      }}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 transition"
                    >
                      <MessageCircle size={18} className="text-gray-700" />
                      <span className="text-xs">
                        {post.comments?.length || 0}
                      </span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
        {videoModalOpen && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <button
              onClick={() => setVideoModalOpen(false)}
              className="absolute top-4 right-4 bg-white/20 backdrop-blur p-2 rounded-full"
            >
              <CloseIcon size={20} className="text-white" />
            </button>

            <video
              src={currentVideoSrc}
              controls
              autoPlay
              className="w-full max-w-2xl rounded-xl shadow-xl"
            />
          </div>
        )}
       {commentModalOpen && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="bg-white w-full max-w-md rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center bg-white sticky top-0 z-20">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          Comments
          <span className="text-sm text-gray-500">
            ({activePostComments.length})
          </span>
        </h2>

        <button
          onClick={() => setCommentModalOpen(false)}
          className="hover:bg-gray-100 p-2 rounded-full transition"
        >
          <CloseIcon size={20} className="text-gray-500" />
        </button>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {activePostComments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <MessageCircle size={48} className="text-gray-300 mb-4" />
            <p className="text-gray-600 font-medium">No comments yet</p>
            <p className="text-sm text-gray-400">Be the first to comment!</p>
          </div>
        ) : (
          activePostComments.map((c) => (
            <div key={c._id} className="flex gap-3">
              <img
                src={c.user?.profilePic || defaultPic}
                alt={c.user?.username}
                className="w-11 h-11 rounded-full object-cover border border-gray-200"
              />

              <div className="flex-1 bg-gray-50 p-3 rounded-xl">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-gray-800 text-sm">
                    {c.user?.username}
                  </h4>
                  <span className="text-[10px] text-gray-400">
                    {new Date(c.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                <p className="text-gray-700 text-sm mt-1 leading-snug">
                  {c.text}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Comment Input – Floating Bar */}
      <form
        onSubmit={handleAddComment}
        className="flex items-center gap-3 p-4 border-t border-gray-200 bg-white sticky bottom-0"
      >
        <img
          src={user?.profilePic || defaultPic}
          className="w-9 h-9 rounded-full object-cover"
        />

        <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2">
          <input
            className="w-full bg-transparent outline-none text-sm text-gray-700"
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={!commentText.trim()}
          className="text-[#719FB0] font-semibold disabled:opacity-40"
        >
          Post
        </button>
      </form>
    </motion.div>
  </div>
)}

      </div>
    </div>
  );
};

export default UserProfile;
