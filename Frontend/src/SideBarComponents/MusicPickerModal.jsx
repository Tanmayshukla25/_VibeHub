import React, { useState } from "react";
import { X, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MusicPickerModal = ({ isOpen, onClose, onSelect }) => {
  const [query, setQuery] = useState("");
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const searchSongs = async () => {
    if (!query.trim()) return;
    try {
      setLoading(true);

      const res = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(
          query
        )}&entity=song&limit=100`
      );
      const data = await res.json();
      setSongs(data.results || []);
    } catch (err) {
      console.log("Song search error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b text-pink-600 font-semibold">
            <span>Select Music</span>
            <button onClick={onClose}>
              <X size={22} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-2 p-3">
            <input
              type="text"
              placeholder="Search songs..."
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring focus:ring-pink-400/50 outline-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              onClick={searchSongs}
              className="bg-pink-500 text-white p-2 rounded-lg"
            >
              <Search size={20} />
            </button>
          </div>

          {/* Song list */}
          <div className="max-h-80 overflow-y-auto p-3">
            {loading && <p className="text-center text-gray-500">Loading...</p>}

            {!loading &&
              songs.map((s) => (
                <div
                  key={s.trackId}
                  onClick={() =>
                    onSelect({
                      songUrl: s.previewUrl,
                      songName: `${s.trackName} - ${s.artistName}`,
                    })
                  }
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 cursor-pointer"
                >
                  <img
                    src={s.artworkUrl100}
                    className="w-12 h-12 rounded-lg"
                    alt=""
                  />
                  <div>
                    <p className="font-semibold text-sm">{s.trackName}</p>
                    <p className="text-xs text-gray-500">{s.artistName}</p>
                  </div>
                  <audio src={s.previewUrl} preload="none" className="hidden" />
                </div>
              ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MusicPickerModal;
