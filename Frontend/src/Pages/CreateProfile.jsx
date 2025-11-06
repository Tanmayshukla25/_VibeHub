import { useState, useEffect } from "react";
import { Camera, User } from "lucide-react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import VibeHubLogo from "../assets/VibeHub.png";
import instance from "../axiosConfig";
const Default = "/Default.png";

const CreateProfile = () => {
  const [bio, setBio] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const location = useLocation();
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const id = location.state?.userId;
    if (id) {
      setUserId(id);
      console.log("✅ Received userId:", id);
    } else {
      setMessage({
        text: "User ID not found. Please register again.",
        type: "error",
      });
      setTimeout(() => navigate("/register"), 1500);
    }
  }, [location.state, navigate]);

  // 📸 Image Preview Handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // 📝 Submit Handler
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setMessage({ text: "", type: "" });

  //   if (!userId) {
  //     setMessage({ text: "User ID missing. Please try again.", type: "error" });
  //     return;
  //   }

  //   const formData = new FormData();
  //   formData.append("bio", bio);
  //   if (profilePic) formData.append("profilePic", profilePic);

  //   try {
  //     setLoading(true);
  //     const res = await instance.put(`/user/update-profile/${userId}`, formData, {
  //       headers: { "Content-Type": "multipart/form-data" }, // ✅ critical for image upload
  //     });

  //     console.log("✅ Profile updated:", res.data.user);
  //     setMessage({ text: "Profile updated successfully! 🎉", type: "success" });

  //     setTimeout(() => navigate("/"), 1500);
  //   } catch (err) {
  //     console.error("❌ Error updating profile:", err);
  //     setMessage({
  //       text: err.response?.data?.message || "Failed to update profile.",
  //       type: "error",
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    if (!userId) {
      setMessage({ text: "User ID missing. Please try again.", type: "error" });
      return;
    }

    const formData = new FormData();
    formData.append("bio", bio);

    // ✅ if user uploaded pic, send that; otherwise send default
    if (profilePic) {
      formData.append("profilePic", profilePic);
    } else {
      // Optional: assign a default image URL from your assets or a hosted path
      formData.append("profilePic", Default); // imported at top
    }

    try {
      setLoading(true);
      const res = await instance.put(
        `/user/update-profile/${userId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("✅ Profile updated:", res.data.user);
      setMessage({ text: "Profile updated successfully! 🎉", type: "success" });

      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      console.error("❌ Error updating profile:", err);
      setMessage({
        text: err.response?.data?.message || "Failed to update profile.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-[#06b6d4] via-[#2563eb] to-[#6366f1] p-4">
      {/* Logo */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
        <Link to="/">
          <img
            src={VibeHubLogo}
            alt="VibeHub Logo"
            className="w-28 sm:w-32 drop-shadow-lg"
          />
        </Link>
      </div>

      {/* Card */}
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl border border-slate-100 text-center mt-16">
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-[#4A7C8C] to-[#1D5464] bg-clip-text text-transparent">
          Create Your Profile
        </h2>
        <p className="text-slate-500 text-sm mb-6">
          Show the world your vibe ✨
        </p>

        {/* Image Upload Section */}
        <label
          htmlFor="profilePic"
          className="relative cursor-pointer block mx-auto w-32 h-32 rounded-full ring-4 ring-white shadow-md hover:scale-105 transition overflow-visible"
        >
          {/* Inner wrapper for rounded crop */}
          <div className="w-full h-full rounded-full overflow-hidden">
            {preview ? (
              <img
                src={preview}
                alt="preview"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <img
                src={Default}
                alt="default"
                className="w-full h-full object-cover rounded-full"
              />
            )}
          </div>

          {/* Floating camera icon */}
          <div className="absolute bottom-0 right-0 bg-gradient-to-r from-[#4A7C8C] to-[#1D5464] p-2.5 rounded-full shadow-md">
            <Camera className="text-white w-4 h-4" />
          </div>
        </label>

        <input
          id="profilePic"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Bio Field */}
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us about yourself..."
          className="w-full border border-slate-300 rounded-xl px-4 py-3 mt-6 h-24 text-sm focus:ring-2 focus:ring-[#4A7C8C] focus:border-[#4A7C8C] resize-none bg-slate-50"
        ></textarea>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full mt-5 py-2.5 rounded-lg text-white font-semibold transition ${
            loading
              ? "bg-slate-400 cursor-not-allowed"
              : "bg-gradient-to-r from-[#4A7C8C] to-[#1D5464] hover:shadow-lg"
          }`}
        >
          {loading ? "Saving..." : "Complete Profile"}
        </button>

        {/* Message Display */}
        {message.text && (
          <p
            className={`mt-3 text-sm font-medium ${
              message.type === "error" ? "text-red-500" : "text-green-600"
            }`}
          >
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
};

export default CreateProfile;
