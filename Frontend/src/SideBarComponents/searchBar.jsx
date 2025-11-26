import React, { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import instance from "../axiosConfig.js";
import defaultpic from "/Default.png";
import { useNavigate } from "react-router-dom";
import { ChevronsRight } from "../components/ChevronsRight"; // ✅ animated icon

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Debounced search effect
  useEffect(() => {
    if (searchTerm.trim().length < 1) {
      setFilteredUsers([]);
      return;
    }

    if (searchTerm.trim().length >= 3) {
      const timer = setTimeout(() => {
        handleSearch();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [searchTerm]);

  // Handle search query
  const handleSearch = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await instance.get("/user/all");
      const allUsers = res.data.users || res.data;

      const normalizedSearch = searchTerm.replace(/\s+/g, "").toLowerCase();

      const filtered = allUsers.filter((user) =>
        user.username
          ?.replace(/\s+/g, "")
          .toLowerCase()
          .startsWith(normalizedSearch)
      );

      setFilteredUsers(filtered);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch users");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen  md:pt-0 pt-15  bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:py-4 py-1 flex flex-col sm:flex-row sm:items-center sm:justify-between md:gap-3">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-[#4A7C8C] to-[#1D5464] p-2 rounded-lg shadow-md hidden md:block">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="hidden md:block">
              <h1 className=" md:text-2xl font-bold text-slate-800">
                Search Users
              </h1>
              <p className="text-slate-600 text-xs mt-0.5">
                Find people by their username
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-96 mt-2 sm:mt-0">
            <input
              type="text"
              placeholder="Search by username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-5 py-2.5 pr-12 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A7C8C] shadow-sm text-sm transition-all"
            />
            <svg
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Loader */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm z-50">
          <div className="relative w-20 h-20">
            {/* Outer ring */}
            <div className="absolute inset-0 border-4 border-t-transparent border-[#4A7C8C] rounded-full animate-spin"></div>

            {/* Middle glowing circle */}
            <div className="absolute inset-3 bg-gradient-to-r from-[#4A7C8C] to-[#1D5464] rounded-full blur-md animate-pulse"></div>

            {/* Subtle inner highlight */}
            <div className="absolute inset-5 bg-[#4A7C8C] rounded-full blur-[3px] opacity-60"></div>

            {/* Center shimmer */}
            <div className="absolute inset-7 bg-[#1D5464] rounded-full animate-ping opacity-50"></div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="max-w-md mx-auto mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 shadow-sm">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <p>{error}</p>
        </div>
      )}

      {/* Results Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {filteredUsers.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredUsers.map((user) => (
              <div
                key={user._id}
                className="group bg-white rounded-xl shadow-md hover:shadow-lg border border-slate-100 hover:border-[#4A7C8C]/30 transition-all duration-300 overflow-hidden hover:-translate-y-1 relative"
              >
                {/* Gradient Header */}
                <div className="h-20 bg-gradient-to-br from-[#4A7C8C] to-[#1D5464] relative">
                  {/* ✅ Check Profile Button (top-right) */}
                 

                  {/* Profile Picture */}
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                    <div className="relative">
                      <img
                        src={user.profilePic || defaultpic}
                        alt={user.username}
                        className="w-16 h-16 rounded-full bg-white object-cover border-4 border-white shadow-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="pt-10 px-3 pb-3 text-center">
                  <h2 className="font-bold text-slate-800 text-sm mb-0.5 truncate group-hover:text-[#1D5464] transition-colors">
                    {user.name || "Unknown User"}
                  </h2>
                  <p className="text-[#4A7C8C] text-xs font-medium truncate mb-1.5">
                    @{user.username}
                  </p>
                  <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">
                    {user.bio || "No bio available"}
                  </p>

                   <div
                    onClick={() => navigate(`/home/checkprofile/${user._id}`)}
                    className=" flex bg-gradient-to-r from-[#4A7C8C] to-[#1D5464]  items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 text-white text-[15px] font-medium cursor-pointer transition-all hover:scale-100"
                  >
                    <span>View</span>
                    <ChevronsRight stroke="#ffffff" width={20} height={20} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !loading &&
          searchTerm.trim().length >= 3 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="bg-slate-100 rounded-full p-6 mb-4">
                <Sparkles className="w-12 h-12 text-slate-400" />
              </div>
              <p className="text-slate-500 text-lg font-medium">
                No users found
              </p>
              <p className="text-slate-400 text-sm mt-2">
                Try searching with a different username
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default SearchBar;
