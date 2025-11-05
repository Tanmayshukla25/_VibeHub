import { useState } from "react";
import {
  Home,
  Search,
  Compass,
  Clapperboard,
  Send,
  Heart,
  PlusSquare,
  User,
  Menu,
  LogOut,
  CircleX,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import instance from "../axiosConfig";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import VibeHubLogo from "../assets/VibeHub.png";

const Sidebar = () => {
  const [active, setActive] = useState("Home");
  const [showMore, setShowMore] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const res = await instance.post(
        "/user/logout",
        {},
        { withCredentials: true }
      );
      setMessage(res.data.message || "Logout successful!");
      setShowMore(false);

      setTimeout(() => {
        setMessage(null);
        navigate("/");
      }, 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || "Logout failed");
      setShowMore(false);

      setTimeout(() => {
        setMessage(null);
      }, 2000);
    }
  };

  return (
    <>
      <AnimatePresence>
        {message && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            ></motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="fixed inset-0 flex items-center justify-center z-50"
            >
              <div className="bg-white/90 rounded-2xl shadow-lg px-10 py-6 text-center border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">
                  {message}
                </h2>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <div className="h-screen w-[250px] border-r border-gray-200 flex flex-col justify-between fixed bg-gradient-to-tl from-[#a2d2df] via-[#f6efbd] to-[#e4c087]">
        <div>
          <div className="w-[210px] h-[130px]">
            <img src={VibeHubLogo} className=" w-full h-full" alt="" />
          </div>

          <ul className="space-y-3 px-4">
            <Link to="/home">
              {" "}
              <li
                onClick={() => setActive("Home")}
                className={`flex items-center gap-4 cursor-pointer px-3 py-2 rounded-xl transition-all duration-200 ${
                  active === "Home"
                    ? "bg-gray-100 font-semibold"
                    : "hover:bg-gray-100"
                }`}
              >
                <Home size={24} />
                <span>Home</span>
              </li>
            </Link>

            <li
              onClick={() => setActive("Search")}
              className={`flex items-center gap-4 cursor-pointer px-3 mt-2 py-2 rounded-xl transition-all duration-200 ${
                active === "Search"
                  ? "bg-gray-100 font-semibold"
                  : "hover:bg-gray-100"
              }`}
            >
              <Search size={24} />
              <span>Search</span>
            </li>
            <Link to="/home/explore">
              <li
                onClick={() => setActive("Explore")}
                className={`flex items-center gap-4 cursor-pointer px-3 py-2 mb-2 rounded-xl transition-all duration-200 ${
                  active === "Explore"
                    ? "bg-gray-100 font-semibold"
                    : "hover:bg-gray-100"
                }`}
              >
                <Compass size={24} />
                <span>Explore</span>
              </li>
            </Link>

            <li
              onClick={() => setActive("Reels")}
              className={`flex items-center gap-4 cursor-pointer px-3 py-2 rounded-xl transition-all duration-200 ${
                active === "Reels"
                  ? "bg-gray-100 font-semibold"
                  : "hover:bg-gray-100"
              }`}
            >
              <Clapperboard size={24} />
              <span>Reels</span>
            </li>

            <li
              onClick={() => setActive("Messages")}
              className={`flex items-center gap-4 cursor-pointer px-3 py-2 rounded-xl transition-all duration-200 ${
                active === "Messages"
                  ? "bg-gray-100 font-semibold"
                  : "hover:bg-gray-100"
              }`}
            >
              <Send size={24} />
              <span>Messages</span>
            </li>

            <li
              onClick={() => setActive("Notifications")}
              className={`flex items-center gap-4 cursor-pointer px-3 py-2 rounded-xl transition-all duration-200 ${
                active === "Notifications"
                  ? "bg-gray-100 font-semibold"
                  : "hover:bg-gray-100"
              }`}
            >
              <Heart size={24} />
              <span>Notifications</span>
            </li>

            <li
              onClick={() => setActive("Create")}
              className={`flex items-center gap-4 cursor-pointer px-3 py-2 rounded-xl transition-all duration-200 ${
                active === "Create"
                  ? "bg-gray-100 font-semibold"
                  : "hover:bg-gray-100"
              }`}
            >
              <PlusSquare size={24} />
              <span>Create</span>
            </li>
            <Link to="/home/UserProfile">
              <li
                onClick={() => setActive("Profile")}
                className={`flex items-center gap-4 cursor-pointer px-3 py-2 rounded-xl transition-all duration-200 ${
                  active === "Profile"
                    ? "bg-gray-100 font-semibold"
                    : "hover:bg-gray-100"
                }`}
              >
                <User size={24} />
                <span>Profile</span>
              </li>
            </Link>
          </ul>
        </div>

        <div className="relative px-4 py-4 space-y-2">
          <AnimatePresence>
            {showMore && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                onClick={handleLogout}
                className="absolute -top-7 left-4 right-4 bg-white shadow-lg rounded-xl flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-100"
              >
                <LogOut size={22} />
                <span>Logout</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div
            className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-xl cursor-pointer transition-all duration-200"
            onClick={() => setShowMore((prev) => !prev)}
          >
            <motion.div
              key={showMore ? "cross" : "menu"}
              initial={{ rotate: 0, opacity: 0 }}
              animate={{ rotate: showMore ? 180 : 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {showMore ? <CircleX size={24} /> : <Menu size={24} />}
            </motion.div>

            <span>{showMore ? "Close" : "More"}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
