import Post from "../models/postSchema.js";
import User from "../models/userSchema.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";
// 🧷 Create Post (with Cloudinary)
// export const createPost = async (req, res) => {
//   try {
//     const { caption, author } = req.body;

//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({ message: "Please upload at least one file" });
//     }

//     // Upload each file to Cloudinary
//     const uploadedFiles = [];
//     for (const file of req.files) {
//       const result = await cloudinary.uploader.upload(file.path, {
//         folder: "user_uploads",
//         resource_type: "auto",
//       });

//       uploadedFiles.push({
//         type: file.mimetype.startsWith("video") ? "video" : "image",
//         url: result.secure_url,
//         public_id: result.public_id,
//       });
//     }

//     // Create new post
//     const newPost = new Post({
//       caption,
//       author,
//       media: uploadedFiles,
//     });

//     await newPost.save();

//     // Add post to user’s posts list
//     await User.findByIdAndUpdate(author, { $push: { posts: newPost._id } });

//     res.status(201).json({
//       message: "✅ Post uploaded successfully!",
//       post: newPost,
//     });
//   } catch (error) {
//     console.error("❌ Error creating post:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };


// controllers/postController.js


export const createPost = async (req, res) => {
  try {
    const { caption, author } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const uploadedFiles = [];

    for (const file of req.files) {
      // Helpful debug log
      console.log("Uploading file:", file.originalname, "mimetype:", file.mimetype, "path:", file.path);

      // Case A: file.path exists AND looks like a local temp path (multer dest)
      const isLocalFile = file.path && !file.path.startsWith("http") && !file.path.includes("res.cloudinary.com");

      if (isLocalFile) {
        // Use upload_large for videos, upload for images
        let result;
        if (file.mimetype.startsWith("video")) {
          result = await cloudinary.uploader.upload_large(file.path, {
            folder: "user_uploads",
            resource_type: "video",
            chunk_size: 6000000, // 6MB chunks (adjust if needed)
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

        // cleanup local temp file if exists
        try {
          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        } catch (err) {
          console.warn("Failed to delete temp file:", file.path, err.message);
        }
      } else {
        // Case B: file already uploaded by multer-storage-cloudinary OR `file.path` is URL
        // multer-storage-cloudinary usually returns file.path = secure_url or file.secure_url
        const url = file.path || file.secure_url || file.url || null;

        if (!url) {
          // fallback — try to upload from buffer if available
          if (file.buffer) {
            const result = await cloudinary.uploader.upload_stream(
              { folder: "user_uploads", resource_type: file.mimetype.startsWith("video") ? "video" : "auto" },
              (error, result) => {
                if (error) throw error;
                return result;
              }
            );
            // Note: upload_stream needs stream piping; this branch is uncommon. Prefer to use local dest or storage.
          } else {
            throw new Error("Cannot determine file URL or local path for uploaded file.");
          }
        } else {
          uploadedFiles.push({
            type: file.mimetype && file.mimetype.startsWith("video") ? "video" : "image",
            url,
            public_id: file.public_id || null,
          });
        }
      }
    }

    const newPost = new Post({
      caption,
      author,
      media: uploadedFiles,
    });

    await newPost.save();

    return res.status(201).json({ message: "Post created successfully", post: newPost });
  } catch (error) {
    console.error("❌ Error creating post:", error);
    return res.status(500).json({ message: "Server error while creating post", error: error.message });
  }
};

// 🧩 Get All Posts
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "username name profilePic")
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
    let posts = await Post.find({ author: userId }).sort({ createdAt: -1 });

    // ⭐ FIX: convert likes (ObjectId) → string
    posts = posts.map((p) => ({
      ...p._doc,
      likes: p.likes.map((l) => l.toString()),
      comments: p.comments || [],
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
    res.status(500).json({ message: "Error deleting post", error: error.message });
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
    const { id } = req.params;   // postId
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
      createdAt: new Date()
    };

    post.comments.push(newComment);
    await post.save();

    // Populate full user details (username, profilePic)
    const populated = await Post.findById(id)
      .populate("comments.user", "username profilePic");

    res.status(200).json({
      message: "Comment added successfully",
      comments: populated.comments,
    });

  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Error adding comment", error: error.message });
  }
};


// 💬 Get Comments of a Post
export const getPostComments = async (req, res) => {
  try {
    const { id } = req.params; // postId
    const post = await Post.findById(id).populate("comments.user", "username profilePic");

    if (!post) return res.status(404).json({ message: "Post not found" });

    res.status(200).json(post.comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Error fetching comments", error: error.message });
  }
};
