import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "user_images", 
    allowed_formats: ["jpg", "png", "jpeg","webp","avif","jfif"],
    public_id: (req, file) => `user-${Date.now()}`, 
  },
});

export const uploadCloud = multer({ storage: storage });