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

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
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
      setMessage({ text: "User ID missing. Please register again.", type: "error" });
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

      setMessage({ text: "🎉 Date of birth updated successfully!", type: "success" });
      const email = response.data.user?.email;
      if (email) await instance.post("/user/send-code", { email });

      setTimeout(() => navigate("/Mail", { state: { userId: response.data.user.id } }), 1000);
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || "Error updating date of birth.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const Loader = () => (
    <motion.div className="flex justify-center items-center space-x-2">
      <motion.div className="w-4 h-4 bg-white rounded-full" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity }} />
      <motion.div className="w-4 h-4 bg-white rounded-full" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, delay: 0.2, repeat: Infinity }} />
      <motion.div className="w-4 h-4 bg-white rounded-full" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, delay: 0.4, repeat: Infinity }} />
    </motion.div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#06b6d4] via-[#2563eb] to-[#6366f1] p-4">
      <Link to="/" className="mb-4">
        <img src={VibeHubLogo} alt="VibeHub" className="w-28 sm:w-32 drop-shadow-md" />
      </Link>

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-[380px] text-center border border-slate-100"
      >
        <img src={cakeImg} alt="cake" className="w-20 mx-auto mb-3" />
        <h2 className="text-xl font-semibold mb-2 text-slate-800">Add your date of birth</h2>
        <p className="text-sm text-slate-500 mb-3">This won't be part of your public profile.</p>

        {message.text && (
          <p className={`text-sm mb-3 ${message.type === "error" ? "text-red-500" : "text-green-600"}`}>
            {message.text}
          </p>
        )}

        <div className="flex justify-center gap-3 mt-4">
          <select name="month" value={dob.month} onChange={handleChange} className="border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#4A7C8C]">
            <option value="">Month</option>
            {months.map((m) => <option key={m}>{m}</option>)}
          </select>
          <select name="day" value={dob.day} onChange={handleChange} className="border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#4A7C8C]">
            <option value="">Day</option>
            {days.map((d) => <option key={d}>{d}</option>)}
          </select>
          <select name="year" value={dob.year} onChange={handleChange} className="border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#4A7C8C]">
            <option value="">Year</option>
            {years.map((y) => <option key={y}>{y}</option>)}
          </select>
        </div>

        <button
          onClick={handleNext}
          disabled={loading}
          className={`mt-6 w-full py-2 text-white font-semibold rounded-lg transition ${
            loading
              ? "bg-slate-400 cursor-not-allowed"
              : "bg-gradient-to-r from-[#4A7C8C] to-[#1D5464] hover:shadow-lg"
          }`}
        >
          {loading ? <Loader /> : "Next"}
        </button>

        <Link to="/Register" className="mt-3 text-sm text-[#4A7C8C] hover:text-[#1D5464] hover:underline">
          Go back
        </Link>
      </motion.div>
    </div>
  );
};

export default AddDob;
