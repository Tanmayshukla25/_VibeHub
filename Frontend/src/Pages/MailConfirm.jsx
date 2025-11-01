import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import instance from "../axiosConfig";
import mail from "../assets/mail.png";
import { CheckCheck } from "../components/CheckCheck";
const MailConfirm = () => {
  const [userEmail, setUserEmail] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state?.userId;

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) setUserEmail(storedEmail);
  }, []);

  useEffect(() => {
    if (!userId) {
      console.warn("No userId found. Redirecting...");
      navigate("/register");
    }
  }, [userId, navigate]);

  const handleNext = async () => {
    setMessage({ text: "", type: "" });

    if (!confirmationCode.trim()) {
      setMessage({
        text: "Please enter the confirmation code.",
        type: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await instance.post("/user/verify-code", {
        email: userEmail,
        code: confirmationCode,
      });

      setMessage({
        text: res.data.message || "Code verified successfully!",
        type: "success",
      });
      setTimeout(() => {
        navigate("/profile", { state: { userId } });
      }, 1500);
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || "Invalid verification code.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setMessage({ text: "", type: "" });

    if (!userEmail) {
      setMessage({ text: "User email not found.", type: "error" });
      return;
    }

    try {
      await instance.post("/user/send-code", { email: userEmail });
      setMessage({
        text: "A new verification code has been sent to your email.",
        type: "success",
      });
    } catch (error) {
      console.log(error);
      setMessage({
        text: "Failed to resend code. Try again later.",
        type: "error",
      });
    }
  };

  const handleGoBack = () => navigate(-1);
  const handleLogin = () => navigate("/login");

  return (
    <div className="min-h-screen bg-gradient-to-tl from-[#a2d2df] via-[#f6efbd] to-[#e4c087] flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.7, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md space-y-8"
      >
        <div className="bg-gradient-to-bl from-[#ffe4e6] to-[#ccfbf1] p-8 sm:p-10 rounded-t-xl shadow-2xl border border-gray-100 flex flex-col items-center text-center">
          <div className="text-4xl w-[80px] mb-4 mx-auto">
            <img src={mail} alt="mail" className="mx-auto" />
          </div>

          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Confirm Your Email
          </h1>

          <p className="text-sm text-gray-500 leading-relaxed mb-4">
            Enter the confirmation code we sent to{" "}
            <span className="font-medium text-indigo-600 break-all">
              {userEmail || "your email"}
            </span>
            .{" "}
            <button
              onClick={handleResend}
              className="text-indigo-500 hover:text-indigo-600 font-medium transition duration-150"
            >
              Resend code
            </button>
          </p>

          <input
            type="text"
            placeholder="Enter confirmation code"
            value={confirmationCode}
            onChange={(e) => setConfirmationCode(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 text-base"
            maxLength={6}
          />

          {message.text && (
            <div
              className={`mt-4 flex items-center justify-center gap-2 text-sm font-medium ${
                message.type === "error" ? "text-red-500" : "text-green-600"
              }`}
            >
              {message.type === "success" && (
                <CheckCheck width={24} height={24} stroke="#16a34a" />
              )}
              <p>{message.text}</p>
            </div>
          )}

          <button
            onClick={handleNext}
            disabled={loading}
            className={`mt-6 w-full flex justify-center items-center py-3 px-4 border border-transparent text-base font-semibold rounded-lg shadow-md text-white ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-500 hover:bg-indigo-600 focus:ring-indigo-500"
            } transition duration-300 ease-in-out`}
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 mr-3 text-white"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4zm2 5.29A7.96 7.96 0 014 12H0c0 3.04 1.13 5.82 3 7.94l3-2.65z"
                ></path>
              </svg>
            ) : (
              "Verify"
            )}
          </button>

          <button
            onClick={handleGoBack}
            className="mt-4 text-sm font-medium text-indigo-500 hover:text-indigo-600 transition duration-150"
          >
            Go back
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-gradient-to-bl from-[#ffe4e6] to-[#ccfbf1] p-4 rounded-b-xl shadow-lg border border-gray-100 text-center"
        >
          <p className="text-sm text-gray-600">
            Have an account?{" "}
            <button
              onClick={handleLogin}
              className="font-semibold text-indigo-500 hover:text-indigo-600 transition duration-150"
            >
              Log in
            </button>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default MailConfirm;
