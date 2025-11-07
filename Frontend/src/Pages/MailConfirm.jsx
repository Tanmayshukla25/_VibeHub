import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import instance from "../axiosConfig";
import mail from "../assets/mail.png";
import VibeHubLogo from "../assets/VibeHub.png";
import { CheckCheck } from "../components/CheckCheck";

const MailConfirm = () => {
  const [userEmail, setUserEmail] = useState("");
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state?.userId;
  const inputRefs = useRef([]);

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) setUserEmail(storedEmail);
  }, []);

  
  
  const handleOtpChange = (e, i) => {
    const v = e.target.value.replace(/[^0-9]/g, "");
    const newOtp = [...otpValues];
    newOtp[i] = v;
    setOtpValues(newOtp);
    if (v && i < newOtp.length - 1) inputRefs.current[i + 1].focus();
  };

  const handleOtpKeyDown = (e, i) => {
    if (e.code === "Backspace" && !otpValues[i] && i > 0) inputRefs.current[i - 1].focus();
  };

  const handleNext = async () => {
    const confirmationCode = otpValues.join("");
    if (confirmationCode.length < 6) {
      setMessage({ text: "Enter the 6-digit code.", type: "error" });
      return;
    }

    try {
      setLoading(true);
      console.log("userEmail",userEmail, "otp",confirmationCode);
      const res = await instance.post("/user/verify-code", { email: userEmail, code: confirmationCode });
      setMessage({ text: " Verified successfully!", type: "success" });
      setTimeout(() => navigate("/profile", { state: { userId } }), 1200);
    } catch {
      setMessage({ text: "Invalid verification code.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#06b6d4] via-[#2563eb] to-[#6366f1] p-4 font-sans">
      <img src={VibeHubLogo} alt="logo" className="w-28 sm:w-32 mb-4 drop-shadow-md" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-8 w-full max-w-md text-center"
      >
         <AnimatePresence>
          {message.type === "success" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.5 }}
              className="absolute -top-10 left-1/2 transform -translate-x-1/2"
            >
              <CheckCheck />
            </motion.div>
          )}
        </AnimatePresence>
        <img src={mail} alt="mail" className="w-20 mx-auto mb-3" />
        <h1 className="text-2xl font-semibold text-slate-800 mb-2">Confirm Your Email</h1>
        <p className="text-sm text-slate-600 mb-3">
          We sent a code to <span className="font-medium text-[#2563eb]">{userEmail}</span>
        </p>

        <div className="flex justify-center gap-3 mt-4">
          {otpValues.map((val, i) => (
            <input
              key={i}
              type="tel"
              maxLength="1"
              value={val}
              onChange={(e) => handleOtpChange(e, i)}
              onKeyDown={(e) => handleOtpKeyDown(e, i)}
              ref={(el) => (inputRefs.current[i] = el)}
              className="w-10 h-10 text-center border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#4A7C8C] text-lg font-semibold"
            />
          ))}
        </div>

        {message.text && (
          <p className={`mt-3 text-sm font-medium ${message.type === "error" ? "text-red-500" : "text-green-600"}`}>
            {message.text}
          </p>
        )}

        <button
          onClick={handleNext}
          disabled={loading}
          className={`mt-6 w-full py-2 rounded-lg text-white font-semibold transition ${
            loading
              ? "bg-slate-400 cursor-not-allowed"
              : "bg-gradient-to-r from-[#4A7C8C] to-[#1D5464] hover:shadow-lg"
          }`}
        >
          {loading ? "Verifying..." : "Verify"}
        </button>

        <Link to="/register" className="mt-4 inline-block text-sm text-[#4A7C8C] hover:text-[#1D5464]">
          Go Back
        </Link>
      </motion.div>
    </div>
  );
};

export default MailConfirm;
