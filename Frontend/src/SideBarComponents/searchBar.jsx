import React, { useState, useEffect } from "react";
import instance from "../axiosConfig.js";

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Debounce timer to delay API calls until user stops typing
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
    <div className="flex flex-col items-center mt-8 w-full px-4">
      <div className="relative w-full max-w-2xl mb-6">
        <input
          type="text"
          placeholder="Search by username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-5 py-3 pr-12 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 shadow-sm"
        />
        <svg
          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
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

      {loading && (
        <div className="flex items-center gap-2 text-gray-600">
          <div className="w-5 h-5 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p>Loading users...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
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

      <div className="w-full max-w-2xl mt-6 space-y-3">
        {filteredUsers.length > 0
          ? filteredUsers.map((user) => (
              <div
                key={user._id}
                className="bg-white border border-gray-200 p-4 rounded-xl hover:shadow-lg hover:border-blue-300 transition-all duration-200 flex items-center gap-4 cursor-pointer group"
              >
                <div className="relative">
                  <img
                    src={user.profilePic || "/assets/defaultpic.png"}
                    alt={user.username}
                    className="w-14 h-14 rounded-full object-cover border-2 border-gray-200 group-hover:border-blue-400 transition-colors duration-200"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-lg">
                    {user.name || "Unknown User"}
                  </p>
                  <p className="text-blue-600 text-sm font-medium">
                    @{user.username}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">{user.email}</p>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            ))
          : !loading &&
            searchTerm.trim().length >= 3 && (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 text-gray-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <p className="text-gray-500 text-lg font-medium">
                  No users found
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Try searching with a different username
                </p>
              </div>
            )}
      </div>
    </div>
  );
};

export default SearchBar;
