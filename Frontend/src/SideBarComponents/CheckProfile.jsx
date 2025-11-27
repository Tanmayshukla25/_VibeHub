import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Globe, Calendar, Lock } from "lucide-react";
import instance from "../axiosConfig";
import defaultPic from "../assets/Defalutpic.png";

const CheckProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await instance.get(`/user/${id}`, {
          withCredentials: true,
        });
        setUser(res.data.user);
        console.log(res.data.user);
        
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Failed to load user profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#4A7C8C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );

  if (error || !user)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <p className="text-red-500 font-semibold text-lg">
          {error || "User not found"}
        </p>
      </div>
    );

  return (
    <div className="flex-grow min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Profile Section */}
      <motion.div
        className="rounded-2xl shadow-xl p-6 h-[100vh] relative overflow-hidden"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Cover Header */}
        <div className="h-20 sm:h-32 bg-gradient-to-r from-[#4A7C8C] via-[#2d6374] to-[#1D5464] rounded-xl relative mb-16">
          <div
            onClick={() => navigate(-1)}
            className="bg-white text-gray-700 absolute left-3 sm:top-2 top-4 p-2.5 rounded-full shadow-lg cursor-pointer hover:scale-110 transition z-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </div>

          {/* Profile Picture */}
          <div className="absolute sm:-bottom-16 -bottom-12 left-1/2 transform -translate-x-1/2">
            <div className="sm:w-32 sm:h-32 w-24 h-24 rounded-full bg-white p-1 shadow-2xl overflow-hidden">
              <img
                src={user?.profilePic || defaultPic}
                alt={user?.name}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1">
            {user?.name}
          </h1>
          <p className="text-[#4A7C8C] text-sm font-medium sm:mb-3">
            {user?.username}
          </p>

          {user?.bio && (
            <p className="text-slate-600 text-sm leading-relaxed sm:mb-4 max-w-2xl mx-auto">
              {user.bio}
            </p>
          )}

          {/* Extra Details */}
          <div className="flex flex-wrap justify-center gap-3 text-sm text-slate-600 sm:mb-4">
            {user?.website && (
              <a
                href={user.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-[#4A7C8C] transition"
              >
                <Globe size={16} />
                <span className="underline">Website</span>
              </a>
            )}

            {user?.dob && (
              <div className="flex items-center gap-1.5">
                <Calendar size={16} />
                <span>{new Date(user.dob).toLocaleDateString()}</span>
              </div>
            )}

            {user?.isPrivate && (
              <div className="flex items-center gap-1.5 text-amber-600">
                <Lock size={16} />
                <span>Private Account</span>
              </div>
            )}
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-3 gap-4 mt-2 sm:mt-6 max-w-xs mx-auto">
            <div className="text-center p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[17px] sm:text-2xl font-bold text-slate-800">
                {Array.isArray(user?.posts) ? user.posts.length : 0}
              </p>
              <p className="text-[12px] sm:text-sm text-slate-600">Posts</p>
            </div>

            {/* Followers (clickable) */}
            <div
              onClick={() => navigate(`/home/followers/${user?._id}`)}
              className="cursor-pointer text-center p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-gradient-to-br hover:from-[#4A7C8C]/10 hover:to-[#1D5464]/10 transition-all"
            >
              <p className="text-[17px] sm:text-2xl font-bold text-slate-800">
                {Array.isArray(user?.followers) ? user.followers.length : 0}
              </p>
              <p className="text-[12px] sm:text-sm text-slate-600">Followers</p>
            </div>

            {/* Following (clickable) */}
            <div
              onClick={() => navigate(`/home/following/${user?._id}`)}
              className="cursor-pointer text-center p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-gradient-to-br hover:from-[#4A7C8C]/10 hover:to-[#1D5464]/10 transition-all"
            >
              <p className="text-[17px] sm:text-2xl font-bold text-slate-800">
                {Array.isArray(user?.following) ? user.following.length : 0}
              </p>
              <p className="text-[12px] sm:text-sm text-slate-600">Following</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CheckProfile;
