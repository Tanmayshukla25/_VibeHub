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
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await instance.post("/user/login", formData);
      toast.success("Login successful!");
      console.log(res.data);
      navigate("/Home");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex justify-between items-center h-screen w-screen bg-gradient-to-tl from-[#a2d2df] via-[#f6efbd] to-[#e4c087] px-20 relative overflow-hidden">
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
            <input
              type="text"
              name="email"
              placeholder="Phone number, username, or email address"
              onChange={handleChange}
              className="w-full border border-gray-300 bg-gray-50 p-2 text-sm mb-2 rounded focus:ring-0 focus:border-gray-400"
              required
            />

            <div className="relative mb-4">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                onChange={handleChange}
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

            <button
              type="submit"
              className="bg-blue-400 text-white w-full py-1.5 rounded-lg font-semibold text-sm hover:bg-blue-500 disabled:bg-blue-200 transition"
              disabled={!formData.email || !formData.password}
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
            to="/forgot-password"
            className="text-xs text-blue-900 hover:underline"
          >
            Forgotten your password?
          </Link>
        </motion.div>

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

      <div className="absolute bottom-4 w-full text-center text-xs text-gray-700">
        <p>From Meta</p>
      </div>
    </div>
  );
};

export default Login;
