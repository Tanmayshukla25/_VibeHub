import { useEffect, useState } from "react";
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
import { useNavigate, Link } from "react-router-dom";
import VibeHubLogo from "../assets/VibeHub.png";
import defaultPic from "../assets/Defalutpic.png"; 

const Sidebar = () => {
  const [active, setActive] = useState("Home");
  const [showMore, setShowMore] = useState(false);
  const [message, setMessage] = useState(null);
  const [user, setUser] = useState(null); 
  const navigate = useNavigate();



  
  // ✅ Fetch user data on mount
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
      {/* 🔹 Logout / Message Modal */}
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

      {/* 🔹 Desktop Sidebar */}
      <div className="hidden md:flex h-screen w-[250px] border-r border-gray-200  flex-col justify-between fixed bg-gradient-to-tl from-[#a2d2df] via-[#f6efbd] to-[#e4c087]">
        <div>
          <div className="w-[210px] h-[130px]">
            <img src={VibeHubLogo} className="w-full h-full" alt="logo" />
          </div>

          <ul className="space-y-3 px-4">
            <Link to="/home">
              <li
                onClick={() => setActive("Home")}
                className={`flex items-center gap-4 cursor-pointer px-3 py-2 my-1 rounded-xl transition-all duration-200 ${
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
                className={`flex items-center gap-4 cursor-pointer px-3 py-2 my-1 rounded-xl transition-all duration-200 ${
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
                className={`flex items-center gap-4 cursor-pointer px-3 py-2 my-1 rounded-xl transition-all duration-200 ${
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
              className={`flex items-center gap-4 cursor-pointer px-3 py-2 my-1 rounded-xl transition-all duration-200 ${
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
              className={`flex items-center gap-4 cursor-pointer px-3 py-2 my-1 rounded-xl transition-all duration-200 ${
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
              className={`flex items-center gap-4 cursor-pointer px-3 py-2 my-1 rounded-xl transition-all duration-200 ${
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
              className={`flex items-center gap-4 cursor-pointer px-3 py-2 my-1 rounded-xl transition-all duration-200 ${
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
                className={`flex items-center gap-4 cursor-pointer px-3 py-2 my-1 rounded-xl transition-all duration-200 ${
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

        {/* 🔹 More + Logout Section */}
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

      {/* 🔹 Mobile Bottom Navbar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden justify-around items-center bg-gradient-to-r from-[#a2d2df] via-[#f6efbd] to-[#e4c087] py-3 border-t border-gray-300 shadow-lg">
        <Link to="/home">
          <Home
            size={26}
            onClick={() => setActive("Home")}
            className={`${active === "Home" ? "text-black" : "text-gray-600"}`}
          />
        </Link>

        <Link to="/home/SearchBar">
          <Search
            size={26}
            onClick={() => setActive("Search")}
            className={`${
              active === "Search" ? "text-black" : "text-gray-600"
            }`}
          />
        </Link>

        <PlusSquare
          size={28}
          onClick={() => setActive("Create")}
          className={`${
            active === "Create" ? "text-black scale-110" : "text-gray-600"
          } transition-transform`}
        />

        <Clapperboard
          size={26}
          onClick={() => setActive("Reels")}
          className={`${active === "Reels" ? "text-black" : "text-gray-600"}`}
        />

        <Link to="/home/UserProfile">
          <img
            src={user?.profilePic || defaultPic}
            alt="profile"
            onClick={() => setActive("Profile")}
            className={`w-8 h-8 rounded-full object-cover transition-all ${
              active === "Profile"
                ? "ring-2 ring-black scale-110"
                : "opacity-80"
            }`}
          />
        </Link>
      </div>
    </>
  );
};

export default Sidebar;
