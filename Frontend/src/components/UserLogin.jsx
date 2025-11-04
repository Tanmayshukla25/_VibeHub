import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import instance from "../axiosConfig.js";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import LoginImg from "../assets/Login.png";

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

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();

  // 🧠 Handle input change + validation
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
      setPasswordError(value.length < 8 ? "Password must be at least 8 characters" : "");
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

  // 🚀 Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (emailError || passwordError) {
      toast.error("Please fix validation errors before logging in.");
      return;
    }

    try {
      const res = await instance.post("/user/login", formData);
      toast.success("Login successful!");
      localStorage.setItem("token", res.data.token);
      navigate("/Home");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  const isFormInvalid =
    !formData.email || !formData.password || emailError || passwordError;

  return (
    <div className="flex justify-between items-center h-screen w-screen bg-gradient-to-tl from-[#a2d2df] via-[#f6efbd] to-[#e4c087] px-20 relative overflow-hidden">
      {/* Left Illustration Section */}
      <div className="hidden lg:flex relative items-center justify-center h-full">
        <AnimatedText
          text="VibeHub"
          speed={150}
          className="text-[70px] text-gray-800 billabong-font absolute left-0"
          style={{
            transform: "rotate(270deg)",
            fontFamily: "Billabong, cursive",
            letterSpacing: "2px",
          }}
        />
        <img
          src={LoginImg}
          alt="VibeHub Login Illustration"
          className="w-[600px] h-[600px] object-contain ml-30 filter drop-shadow-[10px_10px_10px_#000]"
        />
      </div>

      {/* Login Form Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col shadow shadow-gray-700 rounded-2xl justify-center items-center w-full max-w-sm ml-auto mr-24"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="rounded-t-2xl bg-gradient-to-bl from-[#ffe4e6] to-[#ccfbf1] p-10 pt-5 pb-5 w-full flex flex-col items-center shadow-xl"
        >
          <h1
            className="text-4xl my-4 text-gray-800"
            style={{ fontFamily: "Billabong, cursive" }}
          >
            VibeHub
          </h1>

          <form onSubmit={handleSubmit} className="w-full">
            {/* Email Field */}
            <input
              type="text"
              name="email"
              placeholder="Enter your Gmail address"
              onChange={handleChange}
              value={formData.email}
              className="w-full border border-gray-300 bg-gray-50 p-2 text-sm mb-1 rounded focus:ring-0 focus:border-gray-400"
              required
            />
            {emailError && (
              <p className="text-red-500 text-xs mb-2">{emailError}</p>
            )}

            {/* Password Field */}
            <div className="relative mb-2">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password (min 8 chars)"
                onChange={handleChange}
                value={formData.password}
                className="w-full border border-gray-300 bg-gray-50 p-2 text-sm rounded focus:ring-0 focus:border-gray-400 pr-10"
                required
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-600 cursor-pointer"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            {/* Password Validation Feedback */}
            {passwordError && (
              <p className="text-red-500 text-xs mt-1">{passwordError}</p>
            )}
            {formData.password && (
              <div className="w-full mt-1 mb-2">
                <div className="flex justify-between text-xs text-gray-600">
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
                <div className="w-full bg-gray-200 h-2 rounded-full">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="bg-blue-400 cursor-pointer text-white w-full py-1.5 rounded-lg font-semibold text-sm hover:bg-blue-500 disabled:bg-blue-200 transition"
              disabled={isFormInvalid}
            >
              Log in
            </button>
          </form>

          <div className="flex items-center w-full my-4">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-gray-500 text-sm font-semibold">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <Link
           
            className="text-xs text-blue-900 hover:underline"
          >
            Forgotten your password?
          </Link>
        </motion.div>

        {/* Footer Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="rounded-b-2xl bg-gradient-to-bl from-[#ffe4e6] to-[#ccfbf1] p-5 w-full mt-2 text-center text-sm shadow-xl"
        >
          <p>
            Don’t have an account?{" "}
            <Link
              to="/Register"
              className="text-blue-500 font-semibold hover:text-blue-700"
            >
              Sign up
            </Link>
          </p>
        </motion.div>
      </motion.div>

      {/* Footer Branding */}
      <div className="absolute bottom-4 w-full text-center text-xs text-gray-700">
        <p>From Meta</p>
      </div>
    </div>
  );
};

export default Login;
