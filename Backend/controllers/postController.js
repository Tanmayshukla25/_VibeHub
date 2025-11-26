import Post from "../models/postSchema.js";
import User from "../models/userSchema.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

export const createPost = async (req, res) => {
  try {
    const caption = req.body.caption;
    const author = req.user.id; 

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const uploadedFiles = [];

    for (const file of req.files) {
      let result;
      if (file.mimetype.startsWith("video")) {
        result = await cloudinary.uploader.upload_large(file.path, {
          folder: "user_uploads",
          resource_type: "video",
        });
      } else {
        result = await cloudinary.uploader.upload(file.path, {
          folder: "user_uploads",
          resource_type: "auto",
        });
      }

      uploadedFiles.push({
        type: file.mimetype.startsWith("video") ? "video" : "image",
        url: result.secure_url,
        public_id: result.public_id,
      });

      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    }

    const newPost = new Post({
      caption,
      author,
      media: uploadedFiles,
    });

    await newPost.save();

    res.status(201).json({ message: "Post created", post: newPost });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};



// 🧩 Get All Posts
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "username name profilePic _id") // 🔥 _id added
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts", error });
  }
};


// 👤 Get Posts by a Specific User
export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    // ✅ Populate author and comments.user so frontend has username/profilePic
    let posts = await Post.find({ author: userId })
      .populate("author", "username profilePic _id")
      .populate("comments.user", "username profilePic _id")
      .sort({ createdAt: -1 })
      .lean();

    // ⭐ Normalize IDs and likes to strings
    posts = posts.map((p) => ({
      ...p,
      _id: String(p._id),
      author: p.author ? { ...p.author, _id: String(p.author._id) } : null,
      likes: (p.likes || []).map((l) => (typeof l === "string" ? l : String(l))),
      comments: (p.comments || []).map((c) => ({
        ...c,
        _id: String(c._id),
        user: c.user ? { ...c.user, _id: String(c.user._id) } : null,
      })),
    }));

    res.status(200).json(posts);
  } catch (error) {
    console.error("getUserPosts error:", error);
    res.status(500).json({ message: "Error fetching user posts", error });
  }
};

// 🗑 Delete Post from Cloudinary + DB
export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Delete media from Cloudinary
    for (const media of post.media) {
      await cloudinary.uploader.destroy(media.public_id, {
        resource_type: media.type === "video" ? "video" : "image",
      });
    }

    await Post.findByIdAndDelete(postId);

    // Remove from user's posts array
    await User.findByIdAndUpdate(post.author, { $pull: { posts: postId } });

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res
      .status(500)
      .json({ message: "Error deleting post", error: error.message });
  }
};

// ❤️ Like or Unlike a Post
// export const toggleLikePost = async (req, res) => {
//   try {
//     const userId = req.body.userId;  // ⭐ force use body
//     const { id } = req.params;

//     if (!userId) {
//       return res.status(400).json({ message: "userId missing" });
//     }

//     const post = await Post.findById(id);
//     if (!post) return res.status(404).json({ message: "Post not found" });
// const already = post.likes.some((uid) => uid.toString() === userId);

//     if (already) {
//       post.likes = post.likes.filter((uid) => uid.toString() !== userId);
//     } else {
//       post.likes.push(userId);
//     }

//     await post.save();

//     return res.status(200).json({
//       message: already ? "unliked" : "liked",
//       likes: post.likes.map((l) => l.toString()),
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

export const toggleLikePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId missing" });
    }

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const already = post.likes.some((uid) => uid.toString() === userId);

    if (already) {
      post.likes = post.likes.filter((uid) => uid.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.status(200).json({
      message: already ? "unliked" : "liked",
      likes: post.likes.map((l) => l.toString()),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// 💬 Add Comment to a Post
export const addComment = async (req, res) => {
  try {
    const { id } = req.params; // postId
    const { text, userId } = req.body;

    if (!text)
      return res.status(400).json({ message: "Comment text is required" });

    if (!userId)
      return res.status(400).json({ message: "userId missing in request" });

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const newComment = {
      user: userId,
      text,
      createdAt: new Date(),
    };

    post.comments.push(newComment);
    await post.save();

    // Populate full user details (username, profilePic)
    const populated = await Post.findById(id).populate(
      "comments.user",
      "username profilePic"
    );

    res.status(200).json({
      message: "Comment added successfully",
      comments: populated.comments,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res
      .status(500)
      .json({ message: "Error adding comment", error: error.message });
  }
};

// 💬 Get Comments of a Post
export const getPostComments = async (req, res) => {
  try {
    const { id } = req.params; // postId
    const post = await Post.findById(id).populate(
      "comments.user",
      "username profilePic"
    );

    if (!post) return res.status(404).json({ message: "Post not found" });

    res.status(200).json(post.comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res
      .status(500)
      .json({ message: "Error fetching comments", error: error.message });
  }
};
