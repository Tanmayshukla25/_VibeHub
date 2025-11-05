import React, { useContext, useEffect, useState } from "react";
import { Camera, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import instance from "../axiosConfig";
import defaultPic from "../assets/defaultpic.png";
import { UserContext } from "../UserContext";

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

  // ✅ Fetch user details
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

  // ✅ Handle profile picture change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProfilePic(file);
    setPreview(URL.createObjectURL(file));
  };

  // ✅ Upload only profile picture
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

  // ✅ Open edit modal
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

  // ✅ Handle edit field changes
  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ✅ Submit updates
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

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="animate-pulse text-gray-500 font-semibold text-lg">
          Loading profile...
        </p>
      </div>
    );

  if (error || !user)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500 font-semibold">
          {error || "User not found"}
        </p>
      </div>
    );

  return (
    <>
      {/* ✅ Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditModal(false)}
            />
            <motion.div
              className="fixed inset-0 flex justify-center items-center z-50"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative">
                <button
                  className="absolute top-3 right-3 text-gray-600 hover:text-black"
                  onClick={() => setShowEditModal(false)}
                >
                  <X size={22} />
                </button>
                <h2 className="text-xl font-semibold mb-4 text-center text-gray-800">
                  Edit Profile
                </h2>

                <form onSubmit={handleUpdateProfile}>
                  {[
                    { label: "Name", name: "name" },
                    { label: "Username", name: "username" },
                    { label: "Email", name: "email" },
                    { label: "Bio", name: "bio" },
                    { label: "Website", name: "website" },
                  ].map((field) => (
                    <div className="mb-3" key={field.name}>
                      <label className="block text-sm text-gray-700 font-medium mb-1">
                        {field.label}
                      </label>
                      <input
                        type="text"
                        name={field.name}
                        value={editData[field.name]}
                        onChange={handleEditChange}
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                      />
                    </div>
                  ))}

                  <div className="mb-3">
                    <label className="block text-sm text-gray-700 font-medium mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="dob"
                      value={editData.dob}
                      onChange={handleEditChange}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                    />
                  </div>

                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="isPrivate"
                      name="isPrivate"
                      checked={editData.isPrivate}
                      onChange={handleEditChange}
                      className="mr-2"
                    />
                    <label htmlFor="isPrivate" className="text-gray-700">
                      Private Account
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={uploading}
                    className={`w-full py-2 rounded-lg text-white font-semibold transition-all ${
                      uploading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    }`}
                  >
                    {uploading ? "Updating..." : "Save Changes"}
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ✅ Profile Page */}
      <div className="flex justify-center items-center min-h-screen p-4">
        <div className="w-full max-w-md p-8 text-center ">
          <div className="flex items-center justify-between mb-8">
            <div className="relative group">
              {auth?._id === user?.id ? (
                <label
                  htmlFor="profilePic"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  className="cursor-pointer"
                >
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center overflow-hidden ring-4 ring-white shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:ring-blue-300">
                    <img
                      src={preview || user?.profilePic || defaultPic}
                      alt="profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div
                    className={`absolute bottom-13 right-5 bg-gradient-to-r from-[#4ade80] via-[#14b8a6] to-[#0891b2] p-2.5 rounded-full shadow-lg transition-all duration-300 ${
                      isHovered ? "scale-110" : ""
                    }`}
                  >
                    <Camera className="w-5 h-5 text-white" />
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
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center overflow-hidden ring-4 ring-white shadow-lg">
                    <img
                      src={user?.profilePic || defaultPic}
                      alt="profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
              <p className="text-sm text-gray-600 mt-3 ">{user?.username}</p>
              <p className="text-xs text-gray-500 mt-1 "><span className="font-bold text-black"> Bio:-</span> {user?.bio}</p>
            </div>

            <div className="text-left ml-4 flex-1">
              <h2 className="text-xl font-semibold text-black">{user?.name}</h2>

              {/* ✅ Posts, Followers, Following */}
              <div className="flex space-x-6 mt-3">
                {[
                  { label: "Posts", count: user?.posts?.length || 0 },
                  { label: "Followers", count: user?.followers?.length || 0 },
                  { label: "Following", count: user?.following?.length || 0 },
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <p className="font-semibold text-lg text-gray-800">
                      {stat.count}
                    </p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <a href={user?.website} target="_blank" rel="noopener noreferrer">
          
            <p className="text-xs text-gray-500 mt-1">
              <span className="font-bold text-black"> WebsiteLink:-</span>
              <span className="text-blue-600">{user?.website}</span>
            </p>
          </a>
          {preview && (
            <button
              onClick={handleUpdateProfilePic}
              disabled={uploading}
              className={`w-full py-2 rounded-lg text-white font-semibold transition-all ${
                uploading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#2dd4bf]  to-[#1f2937] hover:from-blue-700 hover:to-blue-800"
              }`}
            >
              {uploading ? "Uploading..." : "Save Image"}
            </button>
          )}

          {success && (
            <p className="text-green-600 text-sm mt-3 font-medium">{success}</p>
          )}
          {error && (
            <p className="text-red-600 text-sm mt-3 font-medium">{error}</p>
          )}

          <div className="flex space-x-3 mt-8">
            {auth?._id === user?.id && (
              <button
                onClick={openEditModal}
                className=" text-white bg-gradient-to-r from-[#2dd4bf]  to-[#1f2937] hover:bg-gray-200 text-sm px-5 py-2 rounded-lg font-medium border border-gray-300 transition"
              >
                Edit Profile
              </button>
            )}
            <button className="bg-gray-100 hover:bg-gray-200 text-sm px-5 py-2 rounded-lg font-medium border border-gray-300 transition">
              View Archive
            </button>
          </div>

          <div className="w-full border-t border-gray-300 my-8"></div>

          <div className="flex flex-col items-center">
            <div className="w-20 h-20 border-2 border-dashed border-gray-400 rounded-full flex items-center justify-center hover:bg-gray-50 hover:scale-105 transition cursor-pointer bg-white/50 backdrop-blur-sm shadow-inner">
              <Plus size={32} className="text-gray-500" />
            </div>
            <p className="text-gray-600 mt-2 text-sm font-medium">New</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfile;
