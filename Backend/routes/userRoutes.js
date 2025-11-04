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
} from "../controllers/userControllers.js";
import {
  sendVerificationCode,
  verifyCode,
} from "../controllers/verifyEmailController.js";
import { uploadCloud } from "../middleware/cloudinaryUpload.js";
import { verifyToken } from "../middleware/CheckToken.js";

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

export default router;
