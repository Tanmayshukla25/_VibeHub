// import express from "express";
// import {
//   UserRegister,
//   UserLogin,
//   updateDOB,
//   getUserById,
//   updateProfile,
//   UserLogout,
//   getAllUsers,
//   checkAuth,
//   updateFullProfile,
//   getMyProfile,
// } from "../controllers/userControllers.js";
// import {
//   sendVerificationCode,
//   verifyCode,
// } from "../controllers/verifyEmailController.js";
// import { uploadCloud } from "../middleware/cloudinaryUpload.js";
// import { verifyToken } from "../middleware/CheckToken.js";

// const router = express.Router();

// router.get("/verifyToken", verifyToken, checkAuth);

// router.post("/register", UserRegister);
// router.post("/login", UserLogin);
// router.post("/logout", UserLogout);
// router.get("/all", getAllUsers);
// router.post("/send-code", sendVerificationCode);
// router.post("/verify-code", verifyCode);
// router.put("/update-dob", updateDOB);
// router.put(
//   "/update-profile/:id",
//   uploadCloud.single("profilePic"),
//   updateProfile
// );
// router.get("/:id", getUserById);
// router.put("/update/:id", uploadCloud.single("profilePic"), updateFullProfile);


// router.get("/me", verifyToken, getMyProfile);

// // ⚠️ Keep this LAST, always
// router.get("/:id", getUserById);
// export default router;


import express from "express";
import {
  UserRegister,
  UserLogin,
  updateDOB,
  getUserById,
  updateProfile,
  UserLogout,
  getAllUsers,
  checkAuth,
  updateFullProfile,
  getMyProfile,
  deleteAccount,
} from "../controllers/userControllers.js";
import {
  sendVerificationCode,
  verifyCode,
} from "../controllers/verifyEmailController.js";
import { uploadCloud } from "../middleware/cloudinaryUpload.js";
import { verifyToken } from "../middleware/CheckToken.js";

const router = express.Router();

// ---------- STATIC + VERIFIED ROUTES FIRST ----------
router.get("/verifyToken", verifyToken, checkAuth);
router.get("/all", getAllUsers);
router.get("/me", verifyToken, getMyProfile);

// Auth routes
router.post("/register", UserRegister);
router.post("/login", UserLogin);
router.post("/logout", UserLogout);

// Email verification
router.post("/send-code", sendVerificationCode);
router.post("/verify-code", verifyCode);

// Profile update
router.put("/update-dob", updateDOB);
router.put("/update-profile/:id", uploadCloud.single("profilePic"), updateProfile);
router.put("/update/:id", uploadCloud.single("profilePic"), updateFullProfile);

// ---------- ALWAYS KEEP THIS LAST ----------
router.get("/:id", getUserById);
router.delete("/delete", verifyToken, deleteAccount);

export default router;
