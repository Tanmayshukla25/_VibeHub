// // Backend/routes/uploadRoutes.js
// import express from "express";
// import { uploadCloud } from "../middleware/cloudinaryUpload.js";

// const router = express.Router();

// // POST /upload/chatUpload
// router.post("/chatUpload", uploadCloud.single("file"), async (req, res) => {
//   try {
//     // debug line (optional)
//     // console.log("Received upload:", req.file);

//     if (!req.file) {
//       return res.status(400).json({ message: "No file uploaded" });
//     }

//     // multer-cloudinary storage often provides .path
//     const fileUrl = req.file.path || req.file.secure_url || req.file.url;
//     const fileType = req.file.mimetype;
//     const fileName = req.file.originalname;

//     return res.status(200).json({
//       success: true,
//       message: "File uploaded successfully",
//       fileUrl,
//       fileType,
//       fileName,
//     });
//   } catch (error) {
//     console.error("Error uploading file:", error);
//     return res.status(500).json({ message: "File upload failed", error: error.message });
//   }
// });

// export default router;



// routes/uploadRoutes.js
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
