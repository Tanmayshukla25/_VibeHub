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
} from "../controllers/userControllers.js";
import {
  sendVerificationCode,
  verifyCode,
} from "../controllers/verifyEmailController.js";
import { uploadCloud } from "../middleware/cloudinaryUpload.js";
import { verifyToken } from "../middleware/CheckToken.js";
import { getMyProfile } from "../controllers/userControllers.js";

const router = express.Router();

router.get("/verifyToken", verifyToken, checkAuth);

router.post("/register", UserRegister);
router.post("/login", UserLogin);
router.post("/logout", UserLogout);
router.get("/all", getAllUsers);
router.post("/send-code", sendVerificationCode);
router.post("/verify-code", verifyCode);
router.put("/update-dob", updateDOB);
router.put(
  "/update-profile/:id",
  uploadCloud.single("profilePic"),
  updateProfile
);
router.get("/:id", getUserById);
router.put("/update/:id", uploadCloud.single("profilePic"), updateFullProfile);

router.get("/me", verifyToken, getMyProfile);

export default router;
