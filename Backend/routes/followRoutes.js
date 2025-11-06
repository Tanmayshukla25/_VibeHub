import express from "express";
import {
  sendFollowRequest,
  acceptFollowRequest,
  rejectFollowRequest,
  getFollowRequests,
} from "../controllers/followController.js";
import { verifyToken } from "../middleware/CheckToken.js";


const router = express.Router();

router.post("/send/:receiverId", verifyToken, sendFollowRequest);
router.put("/accept/:requestId", verifyToken, acceptFollowRequest);
router.put("/reject/:requestId", verifyToken, rejectFollowRequest);
router.get("/notifications", verifyToken, getFollowRequests);

export default router;
