// CreateProfile.jsx
import { useState, useEffect } from "react";
import { Camera, User } from "lucide-react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import VibeHubLogo from "../assets/VibeHub.png";
import instance from "../axiosConfig";

const CreateProfile = () => {
  const [bio, setBio] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const location = useLocation();
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const idFromState = location.state?.userId;
    if (idFromState) {
      setUserId(idFromState);
      console.log("Received userId from previous page:", idFromState);
    } else {
      setError("User ID not found. Please register again.");
      console.warn("No userId found in CreateProfile — redirecting...");
      setTimeout(() => navigate("/register"), 2000);
    }
  }, [location.state, navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProfilePic(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!userId) {
      setError("User ID missing. Please try again.");
      return;
    }

    const formData = new FormData();
    formData.append("bio", bio);
    if (profilePic) formData.append("profilePic", profilePic);

    try {
      setLoading(true);
      const response = await instance.put(
        `/user/update-profile/${userId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Profile updated:", response.data.user);
      setSuccess("Profile updated successfully! 🎉");
      setBio("");
      setProfilePic(null);
      setPreview(null);

      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex justify-center items-center min-h-screen bg-gradient-to-tl from-[#a2d2df] via-[#f6efbd] to-[#e4c087] p-4">
      {/* Floating logo at top */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center z-20">
        <Link to="/" className="flex items-center">
          <img src={VibeHubLogo} alt="VibeHub Logo" className="w-28 sm:w-32 mb-1 drop-shadow-lg" />
        </Link>
      </div>

      <div className="bg-gradient-to-bl from-[#ffe4e6] to-[#ccfbf1] w-full max-w-md p-8 rounded-3xl shadow-2xl text-center backdrop-blur-sm border border-white/20 mt-16">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-l from-blue-500 via-teal-500 to-green-500 text-transparent bg-clip-text">
            Create Your Profile
          </h2>
          <p className="text-gray-600 text-sm">Show the world your vibe ✨</p>
        </div>

        <div className="flex flex-col items-center space-y-6 mb-8">
          <label
            htmlFor="profilePic"
            className="cursor-pointer group relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center overflow-hidden ring-4 ring-white shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:ring-blue-300">
              {preview ? (
                <img
                  src={preview}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-blue-400" strokeWidth={1.5} />
              )}
            </div>

            <div
              className={`absolute bottom-0 right-0 bg-blue-600 p-2.5 rounded-full shadow-lg transition-all duration-300 ${
                isHovered ? "scale-110" : ""
              }`}
            >
              <Camera className="w-5 h-5 text-white" />
            </div>
          </label>

          <input
            type="file"
            id="profilePic"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />

          <div className="w-full space-y-2">
            <label className="text-left block text-sm font-medium text-gray-700">
              Bio
            </label>
            <textarea
              placeholder="Tell us about yourself... What makes you unique?"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm h-28 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all resize-none bg-white/50 backdrop-blur-sm"
            ></textarea>
            <p className="text-xs text-gray-500 text-right">
              {bio.length} characters
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          } text-white w-full py-3 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0`}
        >
          {loading ? "Updating..." : "Complete Profile"}
        </button>

        {error && (
          <p className="text-red-600 text-sm mt-3 font-medium">{error}</p>
        )}
        {success && (
          <p className="text-green-600 text-sm mt-3 font-medium">{success}</p>
        )}

        <p className="text-xs text-gray-500 mt-4">
          You can always edit this later in settings
        </p>
      </div>
    </div>
  );
};

export default CreateProfile;
