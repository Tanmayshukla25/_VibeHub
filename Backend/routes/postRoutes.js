import express from "express";
import { uploadCloud } from "../middleware/cloudinaryUpload.js";
import Post from "../models/postSchema.js";
import {
  createPost,
  getAllPosts,
  getUserPosts,
  deletePost,
  toggleLikePost,     // 🆕 Added
  addComment,         // 🆕 Added
  getPostComments,    // 🆕 Added
} from "../controllers/postController.js";
import { verifyToken } from "../middleware/CheckToken.js";

const router = express.Router();

// 📸 Create new post
router.post("/create", verifyToken, uploadCloud.array("media", 10), createPost);


// ❤️ Like/Unlike post
router.post("/like/:id", toggleLikePost);

// 💬 Add a comment
router.post("/comment/:id", addComment);

// 💬 Get all comments for a post
router.get("/comments/:id", getPostComments);

// 🗑 Delete post
router.delete("/:postId", deletePost);

// 👤 Get posts by user
router.get("/user/:userId", getUserPosts);

// 🌍 Get all posts
router.get("/all", getAllPosts);

// ⭐ GET SINGLE POST (required for like UI to stay after reload)
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });

    // ⭐ FIX: Convert likes to string IDs
    const cleanPost = {
      ...post._doc,
      likes: post.likes.map((l) => l.toString()),
    };

    res.status(200).json({ post: cleanPost });
  } catch (error) {
    res.status(500).json({ message: "Error fetching post", error });
  }
});


// GET ALL POSTS (Public Feed)



export default router;
