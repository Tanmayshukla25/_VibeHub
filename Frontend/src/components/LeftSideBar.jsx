import { useEffect, useState } from "react";
import {
  Home,
  Search,
  Compass,
  Clapperboard,
  Send,
  PlusSquare,
  User,
  Menu,
  LogOut,
  CircleX,
} from "lucide-react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import instance from "../axiosConfig";
import { useNavigate, Link, useLocation } from "react-router-dom";
import VibeHubLogo from "../assets/VibeHub.png";
import defaultPic from "../assets/Defalutpic.png";
import { BellRing } from "../components/BellRing";
import { BsChatDots } from "react-icons/bs";
const Sidebar = () => {
  const [active, setActive] = useState("Home");
  const [showMore, setShowMore] = useState(false);
  const [message, setMessage] = useState(null);
  const [user, setUser] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const bellControls = useAnimation();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const tokenRes = await instance.get("/user/verifyToken", {
          withCredentials: true,
        });
        const userId = tokenRes.data.user.id;
        const userRes = await instance.get(`/user/${userId}`, {
          withCredentials: true,
        });
        setUser(userRes.data.user);
      } catch (err) {
        console.error("Error fetching user for sidebar:", err);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await instance.get("/follow/notifications", {
          withCredentials: true,
        });
        const count = res.data.requests?.length || 0;

        if (count > pendingCount) {
          bellControls.start("animate");
          setTimeout(() => bellControls.start("normal"), 1000);
        }

        setPendingCount(count);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    fetchNotifications();

    const handleFollowUpdate = () => fetchNotifications();
    window.addEventListener("followUpdate", handleFollowUpdate);

    const interval = setInterval(fetchNotifications, 60000);

    return () => {
      clearInterval(interval);
      window.removeEventListener("followUpdate", handleFollowUpdate);
    };
  }, [pendingCount]);

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
      }, 1500);
    } catch (error) {
      setMessage(error.response?.data?.message || "Logout failed");
      setShowMore(false);
      setTimeout(() => setMessage(null), 1500);
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
            />
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

      <div className="hidden md:flex h-screen w-[250px] border-r border-gray-200 flex-col justify-between fixed bg-[#719FB0]">
        <div>
          <div className="w-[210px] h-[130px]">
            <img src={VibeHubLogo} className="w-full h-full" alt="logo" />
          </div>

          <ul className="space-y-3 px-4">
            <Link to="/home">
              <li
                onClick={() => setActive("Home")}
                className={`flex items-center gap-4 px-3 py-2 rounded-xl transition-all duration-200 cursor-pointer ${
                  active === "Home"
                    ? "bg-gray-100 font-semibold"
                    : "hover:bg-gray-100"
                }`}
              >
                <Home size={24} />
                <span>Home</span>
              </li>
            </Link>

            <Link to="/home/SearchBar">
              <li
                onClick={() => setActive("Search")}
                className={`flex items-center gap-4 px-3 py-2 mt-2 rounded-xl transition-all duration-200 cursor-pointer ${
                  active === "Search"
                    ? "bg-gray-100 font-semibold"
                    : "hover:bg-gray-100"
                }`}
              >
                <Search size={24} />
                <span>Search</span>
              </li>
            </Link>

            <Link to="/home/explore">
              <li
                onClick={() => setActive("Explore")}
                className={`flex items-center gap-4 px-3 py-2 mt-2 rounded-xl transition-all duration-200 cursor-pointer ${
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
              className={`flex items-center gap-4 px-3 mt-2 py-2 rounded-xl transition-all duration-200 cursor-pointer ${
                active === "Reels"
                  ? "bg-gray-100 font-semibold"
                  : "hover:bg-gray-100"
              }`}
            >
              <Clapperboard size={24} />
              <span>Reels</span>
            </li>

            <Link to="/home/messages">
              <li
                onClick={() => setActive("Messages")}
                className={`flex items-center gap-4 px-3 py-2 rounded-xl cursor-pointer ${
                  active === "Messages"
                    ? "bg-gray-100 font-semibold"
                    : "hover:bg-gray-100"
                }`}
              >
                <Send size={24} />
                <span>Messages</span>
              </li>
            </Link>

            <Link to="/home/ChatList">
              <li
                onClick={() => setActive("ChatList")}
                className={`flex items-center gap-4 mt-2 px-3 py-2 rounded-xl cursor-pointer ${
                  active === "ChatList"
                    ? "bg-gray-100 font-semibold"
                    : "hover:bg-gray-100"
                }`}
              >
                <BsChatDots size={28} />
                <span>ChatList</span>
              </li>
            </Link>

            <Link to="/home/Notification">
              <li
                onClick={() => setActive("Notification")}
                className={`relative flex items-center gap-4 mt-2 px-2 py-1 rounded-xl transition-all duration-200 cursor-pointer ${
                  active === "Notification"
                    ? "bg-gray-100 font-semibold"
                    : "hover:bg-gray-100"
                }`}
              >
                <BellRing
                  animate={bellControls}
                  width={26}
                  height={26}
                  stroke="black"
                />
                <span>Notifications</span>
                {pendingCount > 0 && (
                  <span className="absolute right-3 bg-red-500 text-white text-[10px] px-1.5 py-[1px] rounded-full">
                    {pendingCount}
                  </span>
                )}
              </li>
            </Link>

            <li
              onClick={() => setActive("Create")}
              className={`flex items-center gap-4 px-3 py-2 mt-2 rounded-xl transition-all duration-200 cursor-pointer ${
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
                className={`flex items-center gap-4 px-3 py-2 rounded-xl transition-all duration-200 cursor-pointer ${
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
            {showMore ? <CircleX size={24} /> : <Menu size={24} />}
            <span>{showMore ? "Close" : "More"}</span>
          </div>
        </div>
      </div>

      {location.pathname === "/home" && (
        <div className="fixed top-0 left-0 right-0 z-30 flex justify-between items-center bg-[#719FB0] border-b border-gray-300 shadow-sm px-4 py-3 md:hidden">
          <img src={VibeHubLogo} alt="VibeHub Logo" className="w-20" />
          <div className="flex items-center gap-5">
            <Link to="/home/Notification" className="relative">
              <BellRing
                animate={bellControls}
                width={24}
                height={24}
                stroke="black"
              />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 py-[1px] rounded-full">
                  {pendingCount}
                </span>
              )}
            </Link>
            <Link to="/home/messages">
              <Send size={22} className="cursor-pointer hover:text-gray-600" />
            </Link>
          </div>
        </div>
      )}

      {/* 🔹 Mobile Bottom Navbar */}
      {/* 🔹 Mobile Bottom Navbar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden justify-around items-center bg-[#719FB0] py-3 border-t border-gray-300 shadow-lg">
        <Link to="/home" onClick={() => setActive("Home")}>
          <div
            className={`p-2 rounded-full transition-all duration-200 ${
              active === "Home"
                ? "border-2 border-black bg-white/30"
                : "border-2 border-transparent"
            }`}
          >
            <Home
              size={26}
              className={`${
                active === "Home" ? "text-black" : "text-gray-600"
              } transition-colors`}
            />
          </div>
        </Link>

        <Link to="/home/SearchBar" onClick={() => setActive("Search")}>
          <div
            className={`p-2 rounded-full transition-all duration-200 ${
              active === "Search"
                ? "border-2 border-black bg-white/30"
                : "border-2 border-transparent"
            }`}
          >
            <Search
              size={26}
              className={`${
                active === "Search" ? "text-black" : "text-gray-600"
              } transition-colors`}
            />
          </div>
        </Link>

        <Link to="/home/explore" onClick={() => setActive("Explore")}>
          <div
            className={`p-2 rounded-full transition-all duration-200 ${
              active === "Explore"
                ? "border-2 border-black bg-white/30"
                : "border-2 border-transparent"
            }`}
          >
            <Compass
              size={26}
              className={`${
                active === "Explore" ? "text-black scale-110" : "text-gray-600"
              } transition-transform transition-colors`}
            />
          </div>
        </Link>

        <Link to="/home/ChatList" onClick={() => setActive("ChatList")}>
          <div
            className={`p-2 rounded-full transition-all duration-200 ${
              active === "ChatList"
                ? "border-2 border-black bg-white/30"
                : "border-2 border-transparent"
            }`}
          >
            <BsChatDots
              size={26}
              className={`${
                active === "ChatList" ? "text-black" : "text-gray-600"
              } transition-colors`}
            />
          </div>
        </Link>

        <Link to="/home/UserProfile" onClick={() => setActive("Profile")}>
          <div
            className={`p-1 rounded-full transition-all duration-200 ${
              active === "Profile"
                ? "border-2 border-black bg-white/30"
                : "border-2 border-transparent"
            }`}
          >
            <img
              src={user?.profilePic || defaultPic}
              alt="profile"
              className={`w-8 h-8 rounded-full object-cover transition-all ${
                active === "Profile"
                  ? "ring-1 ring-black scale-110"
                  : "opacity-80"
              }`}
            />
          </div>
        </Link>
      </div>
    </>
  );
};

export default Sidebar;
