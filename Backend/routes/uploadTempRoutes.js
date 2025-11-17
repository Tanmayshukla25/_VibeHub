import express from "express";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

router.post("/temp", async (req, res) => {
  try {
    const { base64 } = req.body;

    if (!base64) {
      return res.status(400).json({ error: "No Base64 image provided" });
    }

    // Upload Base64 to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(base64, {
      folder: "ai_temp",
    });

    res.json({ url: uploadResult.secure_url });
  } catch (err) {
    console.error("Cloudinary temp upload error:", err);
    res.status(500).json({ error: "Cloudinary temp upload failed" });
  }
});

export default router;
