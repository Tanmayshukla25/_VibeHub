// // import multer from "multer";
// // import { CloudinaryStorage } from "multer-storage-cloudinary";
// // import cloudinary from "../config/cloudinary.js";

// // const storage = new CloudinaryStorage({
// //   cloudinary: cloudinary,
// //   params: {
// //     folder: "user_images", 
// //     allowed_formats: ["jpg", "png", "jpeg","webp","avif","jfif", "mp4", "mov", "pdf", "zip", "docx"],
// //     public_id: (req, file) => `user-${Date.now()}`, 
// //   },
// // });

// // export const uploadCloud = multer({ storage: storage });


// // middleware/cloudinaryUpload.js
// import multer from "multer";
// import { CloudinaryStorage } from "multer-storage-cloudinary";
// import cloudinary from "../config/cloudinary.js";

// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: async (req, file) => {
//     // ✅ Let Cloudinary auto-detect the resource type (image/video/raw)
//     let resourceType = "auto";

//     // ✅ Force correct type when needed
//     if (file.mimetype.startsWith("video")) {
//       resourceType = "video";
//     } else if (!file.mimetype.startsWith("image")) {
//       resourceType = "raw"; // for pdf, zip, docx etc.
//     }

//     return {
//       folder: "user_uploads", // folder in your Cloudinary account
//       resource_type: resourceType, // <== THIS LINE IS THE FIX 🔥
//       allowed_formats: [
//         "jpg",
//         "png",
//         "jpeg",
//         "webp",
//         "avif",
//         "jfif",
//         "mp4",
//         "mov",
//         "avi",
//         "mkv",
//         "pdf",
//         "zip",
//         "docx",
//       ],
//       public_id: `user-${Date.now()}`,
//     };
//   },
// });

// export const uploadCloud = multer({ storage });



import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    let folder = "user_uploads";
    let resourceType = "auto";

    if (file.mimetype.startsWith("video")) {
      resourceType = "video";   // FIX: MUST BE 'video'
      folder = "chat_videos";
    } else if (file.mimetype.startsWith("image")) {
      resourceType = "image";
      folder = "chat_images";
    } else {
      resourceType = "raw";    // pdf/docx/zip
      folder = "chat_files";
    }

    return {
      folder,
      resource_type: resourceType,
      allowed_formats: [
        "jpg", "png", "jpeg", "webp", "avif", "jfif",
        "mp4", "mov", "avi", "mkv",
        "pdf", "zip", "docx"
      ],
      public_id: `file-${Date.now()}`
    };
  }
});

export const uploadCloud = multer({ storage });
