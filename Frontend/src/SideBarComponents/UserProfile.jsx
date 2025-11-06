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
} from "lucide-react";
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

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#4A7C8C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );

  if (error || !user)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <div className="text-center">
          <p className="text-red-500 font-semibold text-lg">
            {error || "User not found"}
          </p>
        </div>
      </div>
    );

  return (
    <div className="flex-grow min-h-[100vh] bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
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
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
                <button
                  className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition"
                  onClick={() => setShowEditModal(false)}
                >
                  <X size={24} />
                </button>

                <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
                  <div className="w-1 h-8 bg-gradient-to-b from-[#4A7C8C] to-[#1D5464] rounded-full"></div>
                  Edit Profile
                </h2>

                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: "Full Name", name: "name", icon: "👤" },
                      { label: "Username", name: "username", icon: "@" },
                      {
                        label: "Email",
                        name: "email",
                        type: "email",
                        icon: "✉️",
                      },
                      {
                        label: "Website URL",
                        name: "website",
                        type: "text",
                        icon: "🌐",
                      },
                    ].map((field) => (
                      <div key={field.name}>
                        <label className="block text-sm text-slate-700 font-medium mb-2">
                          {field.icon} {field.label}
                        </label>
                        <input
                          type={field.type || "text"}
                          name={field.name}
                          value={editData[field.name]}
                          onChange={handleEditChange}
                          className="w-full border border-slate-200 rounded-xl p-3 text-slate-700 focus:ring-2 focus:ring-[#4A7C8C] focus:border-[#4A7C8C] outline-none transition"
                          required={
                            field.name === "name" ||
                            field.name === "username" ||
                            field.name === "email"
                          }
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-sm text-slate-700 font-medium mb-2">
                      📝 Bio
                    </label>
                    <textarea
                      name="bio"
                      value={editData.bio}
                      onChange={handleEditChange}
                      rows="3"
                      className="w-full border border-slate-200 rounded-xl p-3 text-slate-700 focus:ring-2 focus:ring-[#4A7C8C] focus:border-[#4A7C8C] outline-none transition resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-700 font-medium mb-2">
                        📅 Date of Birth
                      </label>
                      <input
                        type="date"
                        name="dob"
                        value={editData.dob}
                        onChange={handleEditChange}
                        className="w-full border border-slate-200 rounded-xl p-3 text-slate-700 focus:ring-2 focus:ring-[#4A7C8C] focus:border-[#4A7C8C] outline-none transition"
                      />
                    </div>

                    <div className="flex items-end">
                      <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl w-full cursor-pointer hover:bg-slate-50 transition">
                        <input
                          type="checkbox"
                          name="isPrivate"
                          checked={editData.isPrivate}
                          onChange={handleEditChange}
                          className="h-5 w-5 text-[#4A7C8C] border-slate-300 rounded focus:ring-[#4A7C8C]"
                        />
                        <span className="text-slate-700 font-medium text-sm flex items-center gap-2">
                          {editData.isPrivate ? (
                            <Lock size={16} />
                          ) : (
                            <Unlock size={16} />
                          )}
                          Private Account
                        </span>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={handleUpdateProfile}
                    disabled={uploading}
                    className={`w-full py-3 mt-6 rounded-xl text-white font-semibold transition-all transform hover:scale-[1.01] ${
                      uploading
                        ? "bg-slate-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#4A7C8C] to-[#1D5464] hover:shadow-lg"
                    }`}
                  >
                    {uploading ? "💾 Updating..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Back Button */}
      <div
        onClick={() => navigate("/home")}
        className="bg-gradient-to-r from-[#4A7C8C] to-[#1D5464] sm:hidden block text-white fixed top-4 left-4 p-2.5 rounded-full shadow-lg cursor-pointer hover:scale-110 transition z-50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5L8.25 12l7.5-7.5"
          />
        </svg>
      </div>

      {/* Mobile Menu */}
      <div className="fixed top-4 right-4 z-50 md:hidden">
        <div
          className="bg-gradient-to-r from-[#4A7C8C] to-[#1D5464] text-white p-2.5 rounded-full shadow-lg cursor-pointer hover:scale-110 transition"
          onClick={() => setShowMenu((prev) => !prev)}
        >
          {showMenu ? <CircleX size={22} /> : <Menu size={22} />}
        </div>

        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-3 bg-white shadow-xl rounded-xl border border-slate-200 py-2 w-44 overflow-hidden"
            >
              <div
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-red-50 hover:text-red-600 cursor-pointer transition-all"
              >
                <LogOut size={20} />
                <span className="font-medium">Logout</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Profile Content */}
      <div>
        <div className="bg-white h-[100vh] shadow-xl overflow-hidden">
          {/* Cover Header */}
          <div className="h-32 bg-gradient-to-r from-[#4A7C8C] via-[#2d6374] to-[#1D5464] relative">
            <div className="absolute -bottom-16 left-8">
              <div className="relative group">
                {auth?._id === user?.id ? (
                  <label
                    htmlFor="profilePic"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className="cursor-pointer"
                  >
                    <div className="w-32 h-32 rounded-full bg-white p-1 shadow-2xl overflow-hidden transition-transform duration-300 group-hover:scale-105">
                      <img
                        src={preview || user?.profilePic || defaultPic}
                        alt="profile"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <div
                      className={`absolute bottom-2 right-2 bg-gradient-to-r from-[#4A7C8C] to-[#1D5464] p-2 rounded-lg shadow-lg transition-all ${
                        isHovered ? "scale-110" : ""
                      }`}
                    >
                      <Camera className="w-4 h-4 text-white" />
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
                  <div className="w-32 h-32 rounded-2xl bg-white p-1 shadow-2xl overflow-hidden">
                    <img
                      src={user?.profilePic || defaultPic}
                      alt="profile"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="pt-17 px-8 pb-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:gap-50 ">
              <div className="">
                <h1 className="sm:text-3xl text-[15px] font-bold text-slate-800 mb-1">
                  {user?.name}
                </h1>
                <p className="text-[#4A7C8C] sm:text-[15px] text-[12px] font-medium sm:mb-1">
                  {user?.username}
                </p>

                {user?.bio && (
                  <p className="text-slate-600 text-sm leading-relaxed mb-4 max-w-xl">
                    {user.bio}
                  </p>
                )}

                <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                  {user?.website && (
                    <a
                      href={user.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 hover:text-[#4A7C8C] transition"
                    >
                      <Globe size={16} />
                      <span className="underline">Website</span>
                    </a>
                  )}
                  {user?.dob && (
                    <div className="flex items-center gap-1.5">
                      <Calendar size={16} />
                      <span>
                        Born {new Date(user.dob).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {user?.isPrivate && (
                    <div className="flex items-center gap-1.5 text-amber-600">
                      <Lock size={16} />
                      <span>Private Account</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-10 sm:pt-8 mb-3 border-slate-200">
                <Link to="/home/post" className="group">
                  <div className="text-center sm:p-4 rounded-xl bg-slate-50 hover:bg-gradient-to-br hover:from-[#4A7C8C]/10 hover:to-[#1D5464]/10 transition-all border border-slate-100 hover:border-[#4A7C8C]/30">
                    <p className="sm:text-2xl font-bold text-slate-800 group-hover:text-[#1D5464] transition">
                      {user?.posts?.length || 0}
                    </p>
                    <p className="sm:text-sm text-[12px] text-slate-600 mt-1">Posts</p>
                  </div>
                </Link>

                <Link to="/home/followers" className="group">
                  <div className="text-center sm:p-4 rounded-xl bg-slate-50 hover:bg-gradient-to-br hover:from-[#4A7C8C]/10 hover:to-[#1D5464]/10 transition-all border border-slate-100 hover:border-[#4A7C8C]/30">
                    <p className="sm:text-2xl font-bold text-slate-800 group-hover:text-[#1D5464] transition">
                      {user?.followers?.length || 0}
                    </p>
                    <p className="sm:text-sm text-[12px] text-slate-600 mt-1">Followers</p>
                  </div>
                </Link>

                <Link to="/home/following" className="group">
                  <div className="text-center sm:p-4 rounded-xl bg-slate-50 hover:bg-gradient-to-br hover:from-[#4A7C8C]/10 hover:to-[#1D5464]/10 transition-all border border-slate-100 hover:border-[#4A7C8C]/30">
                    <p className="sm:text-2xl font-bold text-slate-800 group-hover:text-[#1D5464] transition">
                      {user?.following?.length || 0}
                    </p>
                    <p className="sm:text-sm text-[12px] text-slate-600 mt-1">Following</p>
                  </div>
                </Link>
              </div>

              {/* Action Buttons */}
            </div>
            {auth?._id === user?.id && (
              <div className="flex gap-2">
                <button
                  onClick={openEditModal}
                  className="sm:px-6 px-2 sm:text-[15px] py-1 sm:py-2.5 bg-gradient-to-r from-[#4A7C8C] to-[#1D5464] text-white sm:rounded-xl rounded text-[13px] sm:font-medium hover:shadow-lg transition-all hover:scale-105"
                >
                  Edit Profile
                </button>
                <button className="sm:px-6 px-2 sm:text-[15px] text-[13px]  bg-slate-100 text-slate-700 sm:rounded-xl rounded  sm:font-medium hover:bg-slate-200 transition">
                  Archive
                </button>
              </div>
            )}

            {/* Stats */}

            {/* Upload Profile Pic Button */}
            {preview && (
              <button
                onClick={handleUpdateProfilePic}
                disabled={uploading}
                className={`w-full py-3 mt-6 rounded-xl text-white font-semibold transition-all ${
                  uploading
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#4A7C8C] to-[#1D5464] hover:shadow-lg hover:scale-[1.01]"
                }`}
              >
                {uploading ? "Uploading..." : "Save Profile Picture"}
              </button>
            )}

            {/* Messages */}
            {success && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-green-700 text-sm font-medium">{success}</p>
              </div>
            )}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* New Post Section */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="flex flex-col items-center">
                <div className="sm:w-20 sm:h-20 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center hover:bg-slate-50 hover:border-[#4A7C8C] hover:scale-105 transition cursor-pointer group">
                  <Plus
                    size={32}
                    className="text-slate-400 group-hover:text-[#4A7C8C]"
                  />
                </div>
                <p className="text-slate-600 mt-3 text-sm font-medium">
                  Create New Post
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
