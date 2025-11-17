import express from "express";
import { uploadCloud } from "../middleware/cloudinaryUpload.js";

const router = express.Router();

router.post("/chatUpload", uploadCloud.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileUrl = req.file.path || req.file.secure_url;
    const fileType = req.file.mimetype;
    const fileName = req.file.originalname;

    console.log("✅ File Uploaded:", { fileUrl, fileType, fileName });

    res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      fileUrl,
      fileType,
      fileName,
    });
  } catch (error) {
    console.error("❌ Error uploading file:", error);
    res.status(500).json({
      message: "File upload failed",
      error: error.message,
    });
  }
});

export default router;
