import { useState, useEffect } from "react";
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

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

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
        setEmailError(
          "Please enter a valid Gmail address (e.g., example@gmail.com)"
        );
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

    try {
      const res = await instance.post("/user/register", {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      localStorage.setItem("userEmail", formData.email);
      navigate("/add-dob");
      toast.success("Registration successful!");
      console.log(res.data);
      navigate("/Dob", { state: { userId: res.data.user.id } });
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Registration failed");
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
    confirmError;

  return (
    <>
      <style>{`
        @keyframes scale-up-center {
          0% { transform: scale(0.1); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .scale-up-center {
          animation: scale-up-center 0.5s cubic-bezier(0.390, 0.575, 0.565, 1.000) both;
        }
      `}</style>

      <div className="flex justify-between items-center h-screen w-screen bg-gradient-to-tl from-[#a2d2df] via-[#f6efbd] to-[#e4c087] px-20 relative overflow-hidden">
        <div className="hidden lg:flex relative items-center justify-center h-full">
          <AnimatedText
            text="JoinVibe"
            speed={150}
            className="text-[70px] text-gray-800 billabong-font absolute left-0"
            style={{
              transform: "rotate(270deg)",
              fontFamily: "Billabong, cursive",
              letterSpacing: "2px",
            }}
          />
          <img
            src={RegisterImg}
            alt="VibeHub Registration Illustration"
            className="w-[600px] h-[600px] object-contain ml-30 filter drop-shadow-[10px_10px_10px_#000]"
          />
        </div>

        <div className="flex flex-col justify-center items-center w-full max-w-sm ml-auto mr-24 scale-up-center shadow shadow-gray-700 rounded-2xl">
          <div className="rounded-t-2xl bg-gradient-to-bl from-[#ffe4e6] to-[#ccfbf1] p-10 pt-5 pb-5 w-full flex flex-col items-center shadow-xl">
            <h1
              className="text-4xl my-4 text-gray-800"
              style={{ fontFamily: "Billabong, cursive" }}
            >
              VibeHub
            </h1>

            <p className="text-gray-500 text-center mb-4 font-semibold">
              Sign up to see photos and videos from your friends.
            </p>

            <form onSubmit={handleSubmit} className="w-full">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                onChange={handleChange}
                value={formData.name}
                className="w-full border border-gray-300 bg-gray-50 p-2 text-sm mb-2 rounded focus:ring-0 focus:border-gray-400"
                required
              />

              <input
                type="text"
                name="username"
                placeholder="Username"
                onChange={handleChange}
                value={formData.username}
                className="w-full border border-gray-300 bg-gray-50 p-2 text-sm mb-2 rounded focus:ring-0 focus:border-gray-400"
                required
              />

              <input
                type="email"
                name="email"
                placeholder="Email"
                onChange={handleChange}
                value={formData.email}
                className="w-full border border-gray-300 bg-gray-50 p-2 text-sm mb-1 rounded focus:ring-0 focus:border-gray-400"
                required
              />
              {emailError && (
                <p className="text-red-500 text-xs mb-2">{emailError}</p>
              )}

              <div className="relative mb-2">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password (min 8 chars)"
                  onChange={handleChange}
                  value={formData.password}
                  className="w-full border mt-1 border-gray-300 bg-gray-50 p-2 text-sm rounded focus:ring-0 focus:border-gray-400 pr-10"
                  required
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 cursor-pointer text-gray-500"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
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

              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  onChange={handleChange}
                  value={formData.confirmPassword}
                  className="w-full border border-gray-300 bg-gray-50 p-2 text-sm rounded focus:ring-0 focus:border-gray-400 pr-10"
                  required
                />
                <span
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-3 cursor-pointer text-gray-500"
                >
                  {showConfirm ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              {confirmError && (
                <p className="text-red-500 text-xs mt-1">{confirmError}</p>
              )}
              {!confirmError &&
                formData.confirmPassword &&
                formData.password === formData.confirmPassword && (
                  <p className="text-green-500 text-xs mt-1">
                    ✅ Passwords match
                  </p>
                )}

              <button
                type="submit"
                className="bg-gradient-to-tr from-[#22c55e] via-[#0e7490] to-[#3b82f6] text-white w-full py-1.5 mt-3 rounded-lg font-semibold text-sm hover:bg-green-500 disabled:bg-green-200 transition"
                disabled={isFormInvalid}
              >
                Sign up
              </button>
            </form>
          </div>

          <div className="rounded-b-2xl bg-gradient-to-bl from-[#ffe4e6] to-[#ccfbf1] p-5 w-full mt-2 text-center text-sm shadow-xl">
            <p>
              Have an account?{" "}
              <Link
                to="/"
                className="text-blue-500 font-semibold hover:text-blue-700"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>

        <div className="absolute bottom-4 w-full text-center text-xs text-gray-700">
          <p>From Meta</p>
        </div>
      </div>
    </>
  );
};

export default Register;
