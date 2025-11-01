import express from 'express';
import { UserRegister, UserLogin, updateDOB, getUserById, updateProfile } from "../controllers/userControllers.js";
import { sendVerificationCode, verifyCode } from '../controllers/verifyEmailController.js';
import { uploadCloud } from '../middleware/cloudinaryUpload.js';



const router = express.Router();


router.post("/register",UserRegister);

router.post("/login",UserLogin);
router.put("/update-dob", updateDOB); 
router.get("/:id", getUserById);
router.post("/send-code", sendVerificationCode);
router.post("/verify-code", verifyCode);
// router.put("/update-profile/:id", uploadCloud.single("profilePic"), updateProfile);
router.put("/update-profile/:id", uploadCloud.single("profilePic"), updateProfile);


export default router; 