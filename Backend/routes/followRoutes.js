// import express from "express";
// import {
//   sendFollowRequest,
//   acceptFollowRequest,
//   rejectFollowRequest,
//   getFollowRequests,
//   cancelFollowRequest,
//   unfollowUser,
//   getFollowStatus,
// } from "../controllers/followController.js";
// import { verifyToken } from "../middleware/CheckToken.js";

// const router = express.Router();

// router.post("/send/:receiverId", verifyToken, sendFollowRequest);
// router.delete("/cancel/:receiverId", verifyToken, cancelFollowRequest);
// router.delete("/unfollow/:receiverId", verifyToken, unfollowUser);
// router.put("/accept/:requestId", verifyToken, acceptFollowRequest);
// router.put("/reject/:requestId", verifyToken, rejectFollowRequest);
// router.get("/notifications", verifyToken, getFollowRequests);
// router.get("/status", verifyToken, getFollowStatus);

// export default router;


import express from "express";
import { verifyToken } from "../middleware/CheckToken.js";
import {
  sendFollowRequest,
  acceptFollowRequest,
  rejectFollowRequest,
  getFollowRequests,
  cancelFollowRequest,
  unfollowUser,
  getFollowStatus,
  getMyFollowers,
  getMyFollowing,
  getFollowersById,
  getFollowingById,
} from "../controllers/followController.js";

const router = express.Router();

router.post("/send/:receiverId", verifyToken, sendFollowRequest);
router.put("/accept/:requestId", verifyToken, acceptFollowRequest);
router.put("/reject/:requestId", verifyToken, rejectFollowRequest);
router.get("/notifications", verifyToken, getFollowRequests);
router.delete("/cancel/:receiverId", verifyToken, cancelFollowRequest);
router.delete("/unfollow/:receiverId", verifyToken, unfollowUser);
router.get("/status", verifyToken, getFollowStatus);

router.get("/me/followers", verifyToken, getMyFollowers);
router.get("/me/following", verifyToken, getMyFollowing);

router.get("/:id/followers", verifyToken, getFollowersById);
router.get("/:id/following", verifyToken, getFollowingById);
export default router;