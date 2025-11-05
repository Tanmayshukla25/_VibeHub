// AddDob.jsx
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import cakeImg from "../assets/cake.png";
import VibeHubLogo from "../assets/VibeHub.png";
import instance from "../axiosConfig";

const AddDob = () => {
  const [dob, setDob] = useState({ month: "", day: "", year: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const navigate = useNavigate();
  const location = useLocation();

  const userId = location.state?.userId;
  console.log("Retrieved userId:", userId);

  if (!userId) {
    console.warn("No userId found. Redirecting to register...");
  }

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDob({ ...dob, [name]: value });
    setMessage({ text: "", type: "" });
  };

  const handleNext = async () => {
    if (!dob.month || !dob.day || !dob.year) {
      setMessage({ text: "Please select your full date of birth.", type: "error" });
      return;
    }

    if (!userId) {
      setMessage({
        text: "User ID missing. Please register again.",
        type: "error",
      });
      navigate("/register");
      return;
    }

    try {
      setLoading(true);

      const response = await instance.put("/user/update-dob", {
        userId,
        day: dob.day,
        month: dob.month,
        year: dob.year,
      });

      console.log("DOB Update Response:", response.data);
      setMessage({
        text: "🎉 Date of birth updated successfully!",
        type: "success",
      });

      const email = response.data.user?.email;
      if (email) {
        try {
          const sendRes = await instance.post("/user/send-code", { email });
          console.log("Verification email response:", sendRes.data);
        } catch (err) {
          console.error("Error sending verification email:", err);
          setMessage({
            text: "DOB saved, but failed to send verification email. Please retry.",
            type: "error",
          });
          return;
        }
      } else {
        console.warn("No email found in backend response.");
      }

      setTimeout(
        () =>
          navigate("/Mail", {
            state: { userId: response.data.user.id },
          }),
        1000
      );
    } catch (error) {
      console.error("Error updating DOB:", error);
      setMessage({
        text: error.response?.data?.message || "Error updating date of birth.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✨ Loader component (Framer Motion spinner)
  const Loader = () => (
    <motion.div
      className="flex justify-center items-center space-x-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="w-4 h-4 bg-white rounded-full"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="w-4 h-4 bg-white rounded-full"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 0.6, delay: 0.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="w-4 h-4 bg-white rounded-full"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 0.6, delay: 0.4, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-tl from-[#a2d2df] via-[#f6efbd] to-[#e4c087] p-4">
      {/* Logo + optional title */}
      <div className="mb-4 flex flex-col items-center">
        <Link to="/" className="flex flex-col items-center">
          <img src={VibeHubLogo} alt="VibeHub Logo" className="w-28 sm:w-32 mb-1 drop-shadow-md" />
        </Link>
      </div>

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
        className="bg-white shadow-lg rounded-2xl p-8 w-[380px] text-center bg-gradient-to-bl from-[#ffe4e6] to-[#ccfbf1]"
      >
        <div className="text-4xl w-[80px] mb-4 mx-auto">
          <img src={cakeImg} alt="cake" className="mx-auto" />
        </div>

        <h2 className="text-xl font-semibold mb-2 text-gray-800">
          Add your date of birth
        </h2>

        <p className="text-sm text-gray-500 mb-2">
          This won't be part of your public profile.
        </p>

        {message.text && (
          <p
            className={`text-sm font-medium mb-3 ${
              message.type === "error" ? "text-red-500" : "text-green-600"
            }`}
          >
            {message.text}
          </p>
        )}

        <div className="flex justify-center gap-3 mt-4">
          <select
            name="month"
            value={dob.month}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">Month</option>
            {months.map((Month) => (
              <option key={Month} value={Month}>
                {Month}
              </option>
            ))}
          </select>

          <select
            name="day"
            value={dob.day}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">Day</option>
            {days.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>

          <select
            name="year"
            value={dob.year}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">Year</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleNext}
          disabled={loading}
          className={`mt-6 w-full ${
            loading
              ? "bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-[#374151] via-[#f43f5e] to-[#fb923c]"
          } text-white font-semibold py-2 rounded-lg transition`}
        >
          {loading ? <Loader /> : "Next"}
        </button>

        <Link to="/Register">
          <button className="mt-3 text-indigo-600 font-medium text-sm hover:underline">
            Go back
          </button>
        </Link>
      </motion.div>
    </div>
  );
};

export default AddDob;
