import express from "express";
import multer from "multer";
import { uploadCloud } from "../middleware/cloudinaryUpload.js";
import Story from "../models/storyModel.js";
import { verifyToken } from "../middleware/CheckToken.js";
import UserAuth from "../models/userSchema.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ⭐ Upload a story
router.post(
  "/create",
  verifyToken,
  uploadCloud.single("media"),
  async (req, res) => {
    try {
      console.log("🔵 Story Create Request:", {
        userId: req.user?._id || req.user?.id,
        file: req.file ? { size: req.file.size, mimetype: req.file.mimetype, path: req.file.path } : "no file",
        songUrl: req.body?.songUrl,
        songName: req.body?.songName,
      });

      const file = req.file;
      const { songUrl, songName } = req.body;

      if (!file) {
        return res.status(400).json({ error: "No media provided" });
      }

      const userId = req.user?._id || req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User ID not found in token" });
      }

      const story = await Story.create({
        user: userId,
        mediaUrl: file.path || file.secure_url,
        mediaType: file.mimetype.startsWith("video") ? "video" : "image",
        songUrl: songUrl || null,
        songName: songName || null,
      });

      console.log("✅ Story created successfully:", story._id);
      res.json({ success: true, story });
    } catch (err) {
      console.error("❌ Story creation error:", err.message, err.stack);
      res.status(500).json({ 
        error: "Failed to create story",
        details: err.message 
      });
    }
  }
);

// ⭐ Get stories of following users + self
router.get("/feed", verifyToken, async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    const user = await UserAuth.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const allowedUsers = [...(user.following || []), userId];

    const stories = await Story.find({
      user: { $in: allowedUsers },
    })
      .populate("user", "username profilePic _id")
      .sort({ createdAt: -1 });

    res.json(stories);
  } catch (err) {
    console.log("❌ Story feed error:", err);
    res.status(500).json({ error: "Failed to load stories", details: err.message });
  }
});


export default router;
