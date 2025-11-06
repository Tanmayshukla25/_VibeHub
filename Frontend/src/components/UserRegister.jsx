import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import instance from "../axiosConfig.js";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import RegisterImg from "../assets/Login.png";

const AnimatedText = ({ text, speed, className, style }) => {
  const [displayText, setDisplayText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeoutId = setTimeout(() => {
        setDisplayText((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timeoutId);
    }
  }, [index, text, speed]);

  return (
    <h1 className={className} style={style}>
      {displayText}
    </h1>
  );
};

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
      transition={{
        duration: 0.6,
        delay: 0.2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
    <motion.div
      className="w-4 h-4 bg-white rounded-full"
      animate={{ y: [0, -6, 0] }}
      transition={{
        duration: 0.6,
        delay: 0.4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  </motion.div>
);

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [emailError, setEmailError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "email") {
      if (value && !/^[\w.+-]+@gmail\.com$/.test(value)) {
        setEmailError("Please enter a valid Gmail address (e.g., user@gmail.com)");
      } else {
        setEmailError("");
      }
    }

    if (name === "password") {
      let strength = 0;
      if (value.length >= 8) strength++;
      if (/[A-Z]/.test(value)) strength++;
      if (/[a-z]/.test(value)) strength++;
      if (/[0-9]/.test(value)) strength++;
      if (/[^A-Za-z0-9]/.test(value)) strength++;
      setPasswordStrength(strength);
      setPasswordError(
        value.length < 8 ? "Password must be at least 8 characters" : ""
      );

      if (formData.confirmPassword) {
        setConfirmError(
          formData.confirmPassword !== value ? "Passwords do not match" : ""
        );
      }
    }

    if (name === "confirmPassword") {
      setConfirmError(
        value && value !== formData.password ? "Passwords do not match" : ""
      );
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return "bg-red-500";
    if (passwordStrength <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return "Weak";
    if (passwordStrength <= 3) return "Medium";
    return "Strong";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (emailError || passwordError) {
      toast.error("Please fix validation errors before submitting.");
      return;
    }

    setLoading(true);
    try {
      const res = await instance.post("/user/register", formData);
      toast.success("Registration successful!");
      const userId = res.data?.user?.id || res.data?.id;
      setTimeout(() => {
        navigate("/Dob", { state: { userId } });
      }, 800);
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const isFormInvalid =
    !formData.name ||
    !formData.username ||
    !formData.email ||
    !formData.password ||
    !formData.confirmPassword ||
    emailError ||
    passwordError ||
    confirmError ||
    loading;

  return (
    <div className="flex flex-col lg:flex-row justify-center lg:justify-between items-center h-screen w-screen bg-gradient-to-b from-[#06b6d4] via-[#2563eb] to-[#6366f1] relative overflow-y-auto">
      {/* Left side image */}
      <div className="hidden lg:flex relative items-center justify-center h-full">
        <AnimatedText
          text="JoinVibe"
          speed={150}
          className="hidden xl:block text-[70px] text-slate-800 billabong-font absolute left-0"
          style={{
            transform: "rotate(270deg)",
            fontFamily: "Billabong, cursive",
            letterSpacing: "2px",
          }}
        />
        <img
          src={RegisterImg}
          alt="Register Illustration"
          className="w-[450px] h-[450px] xl:w-[600px] xl:h-[600px] object-contain ml-30 filter drop-shadow-[10px_10px_10px_#00000030]"
        />
      </div>

      {/* Form Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col shadow-lg rounded-2xl justify-center items-center w-full max-w-xs sm:max-w-sm mx-auto lg:ml-auto lg:mr-24"
      >
        <div className="rounded-t-2xl bg-white p-8 pt-4 pb-4 w-full flex flex-col items-center shadow-xl border border-slate-100">
          <h1
            className="text-4xl my-4 bg-gradient-to-r from-[#4A7C8C] to-[#1D5464] bg-clip-text text-transparent"
            style={{ fontFamily: "Billabong, cursive" }}
          >
            VibeHub
          </h1>

          <p className="text-slate-500 text-center mb-4 font-semibold text-sm">
            Sign up to see photos and videos from your friends.
          </p>

          <form onSubmit={handleSubmit} className="w-full">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              onChange={handleChange}
              value={formData.name}
              className="w-full border border-slate-200 bg-slate-50 p-2 text-sm mb-2 rounded-lg focus:ring-2 focus:ring-[#4A7C8C] focus:border-[#4A7C8C] outline-none transition"
            />
            <input
              type="text"
              name="username"
              placeholder="Username"
              onChange={handleChange}
              value={formData.username}
              className="w-full border border-slate-200 bg-slate-50 p-2 text-sm mb-2 rounded-lg focus:ring-2 focus:ring-[#4A7C8C] focus:border-[#4A7C8C] outline-none transition"
            />
            <input
              type="email"
              name="email"
              placeholder="Enter your Gmail address"
              onChange={handleChange}
              value={formData.email}
              className="w-full border border-slate-200 bg-slate-50 p-2 text-sm mb-1 rounded-lg focus:ring-2 focus:ring-[#4A7C8C] focus:border-[#4A7C8C] outline-none transition"
            />
            {emailError && <p className="text-red-500 text-xs mb-2">{emailError}</p>}

            <div className="relative mb-2">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password (min 8 chars)"
                onChange={handleChange}
                value={formData.password}
                className="w-full border border-slate-200 bg-slate-50 p-2 text-sm rounded-lg focus:ring-2 focus:ring-[#4A7C8C] focus:border-[#4A7C8C] outline-none transition pr-10"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-600 cursor-pointer hover:text-[#4A7C8C] transition"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            {passwordError && <p className="text-red-500 text-xs mt-1">{passwordError}</p>}
            {formData.password && (
              <div className="w-full mt-1 mb-2">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Password Strength:</span>
                  <span
                    className={`font-medium ${
                      passwordStrength <= 2
                        ? "text-red-500"
                        : passwordStrength <= 3
                        ? "text-yellow-500"
                        : "text-green-500"
                    }`}
                  >
                    {getPasswordStrengthText()}
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="relative mb-2">
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                onChange={handleChange}
                value={formData.confirmPassword}
                className="w-full border border-slate-200 bg-slate-50 p-2 text-sm rounded-lg focus:ring-2 focus:ring-[#4A7C8C] focus:border-[#4A7C8C] outline-none transition pr-10"
              />
              <span
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-2.5 text-slate-600 cursor-pointer hover:text-[#4A7C8C] transition"
              >
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            {confirmError && <p className="text-red-500 text-xs mt-1">{confirmError}</p>}
            {!confirmError &&
              formData.confirmPassword &&
              formData.password === formData.confirmPassword && (
                <p className="text-green-500 text-xs mt-1">✅ Passwords match</p>
              )}

            <button
              type="submit"
              disabled={isFormInvalid}
              className={`w-full py-2 rounded-lg font-semibold text-sm text-white transition flex justify-center items-center ${
                isFormInvalid
                  ? "bg-slate-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#4A7C8C] to-[#1D5464] hover:shadow-lg cursor-pointer"
              }`}
            >
              {loading ? <Loader /> : "Sign up"}
            </button>
          </form>
        </div>

        <div className="rounded-b-2xl bg-white p-5 w-full mt-2 text-center text-sm shadow-xl border border-slate-100">
          <p className="text-slate-700">
            Have an account?{" "}
            <Link
              to="/"
              className="text-[#4A7C8C] font-semibold hover:text-[#1D5464] transition"
            >
              Log in
            </Link>
          </p>
        </div>
      </motion.div>

      <div className="absolute bottom-4 w-full text-center text-xs text-slate-600">
        <p>From Meta</p>
      </div>
    </div>
  );
};

export default Register;
