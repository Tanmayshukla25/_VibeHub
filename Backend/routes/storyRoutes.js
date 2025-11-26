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
      const file = req.file;
      const { songUrl, songName } = req.body;

      if (!file) return res.status(400).json({ error: "No media provided" });

      const story = await Story.create({
        user: req.user.id,
        mediaUrl: file.path || file.secure_url,
        mediaType: file.mimetype.startsWith("video") ? "video" : "image",
        songUrl,
        songName,
      });

      res.json({ success: true, story });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create story" });
    }
  }
);

// ⭐ Get stories of following users + self
router.get("/feed", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id; // ✔ correct

    const user = await UserAuth.findById(userId);

    const allowedUsers = [...user.following, userId];

    const stories = await Story.find({
      user: { $in: allowedUsers },
    }).populate("user", "username profilePic");

    res.json(stories);
  } catch (err) {
    console.log("Story feed error:", err);
    res.status(500).json({ error: "Failed to load stories" });
  }
});


export default router;
