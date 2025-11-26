import mongoose from "mongoose";

const storySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  mediaUrl: { type: String, required: true },
  mediaType: { type: String, enum: ["image", "video"], required: true },

  songUrl: { type: String, default: null },
  songName: { type: String, default: null },

  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600,  // ⭐ Story auto deletes after 1 hour
  },
});

export default mongoose.model("Story", storySchema);
