import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import instance from "../axiosConfig";
import defaultPic from "../assets/Defalutpic.png";
import { Heart, MessageCircle } from "lucide-react";
import { FaRegBookmark } from "react-icons/fa";
import { motion } from "framer-motion";
import { IoArrowBackCircle } from "react-icons/io5";
export default function SinglePostPage() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loggedUser, setLoggedUser] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [showCommentsBox, setShowCommentsBox] = useState(false);

  const commentRef = useRef(null);

  // Fetch logged user
  useEffect(() => {
    const fetchLoggedUser = async () => {
      try {
        const res = await instance.get("/user/verifyToken", {
          withCredentials: true,
        });
        setLoggedUser(res.data.user);
      } catch (err) {
        console.log("User fetch failed", err);
      }
    };
    fetchLoggedUser();
  }, []);

  // Fetch post
  const fetchPost = async () => {
    try {
      const res = await instance.get(`/post/${postId}`, {
        withCredentials: true,
      });

      console.log("🔥 SINGLE POST RESPONSE =>", res.data.post); // ADD THIS
      setPost(res.data.post);
    } catch (err) {
      console.log("Post fetch error:", err);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [postId]);

  if (!post) return <p className="text-center mt-10">Loading post...</p>;

  const loggedUserId = String(loggedUser?._id || "");

  // ✔ Toggle Like
  const toggleLike = async () => {
    try {
      const already = post.likes.includes(loggedUserId);

      setPost((prev) => ({
        ...prev,
        likes: already
          ? prev.likes.filter((id) => id !== loggedUserId)
          : [...prev.likes, loggedUserId],
      }));

      await instance.post(
        `/post/like/${post._id}`,
        { userId: loggedUserId },
        { withCredentials: true }
      );
    } catch (err) {
      console.log(err);
    }
  };

  // ✔ Add Comment
  const addComment = async () => {
    if (!commentText.trim()) return;

    try {
      await instance.post(
        `/post/comment/${post._id}`,
        { text: commentText, userId: loggedUserId },
        { withCredentials: true }
      );

      setCommentText("");
      fetchPost();
    } catch (err) {
      console.log("Comment error:", err);
    }
  };

  // Video or Image?
  const isVideo = post.media?.[0]?.type?.startsWith("video");

  return (
    <div className="w-full min-h-screen bg-gray-50 flex justify-center relative p-4">
      {/* BACK BUTTON OUTSIDE THE CARD */}
      <button
        onClick={() => navigate(-1)}
        className="fixed left-[530px] top-7 z-50 p-1 rounded-full bg-white shadow-md hover:scale-105 transition"
      >
        <IoArrowBackCircle size={34} className="text-gray-700" />
      </button>

      <div className="max-w-xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
        >
          {/* HEADER */}
          {/* HEADER */}
          <div className="flex items-center gap-3 px-4 py-3 border-b">
            <img
              src={post.author?.profilePic || defaultPic}
              className="w-11 h-11 rounded-full object-cover"
              alt=""
            />
            <div>
              <p className="text-sm text-gray-600 font-semibold">
                {post.author?.username}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* MEDIA */}
          <div className="bg-black">
            {isVideo ? (
              <video
                src={post.media[0].url}
                className="w-full h-[520px] aspect-square object-cover"
                controls
                autoPlay
              />
            ) : (
              <img
                src={post.media[0].url}
                className="w-full h-[520px] aspect-square object-cover"
                alt=""
              />
            )}
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-5 px-4 py-3">
            <button onClick={toggleLike}>
              <Heart
                size={28}
                fill={post.likes.includes(loggedUserId) ? "red" : "none"}
                className={
                  post.likes.includes(loggedUserId)
                    ? "text-red-500"
                    : "text-gray-700"
                }
              />
            </button>

            <button
              onClick={() => {
                setShowCommentsBox(true);
                setTimeout(() => {
                  commentRef.current?.scrollIntoView({ behavior: "smooth" });
                }, 200);
              }}
            >
              <MessageCircle size={28} className="text-gray-700" />
            </button>

            <FaRegBookmark size={26} className="ml-auto text-gray-700" />
          </div>

          {/* Likes */}
          <p className="px-4 font-semibold text-gray-600 text-sm">
            {post.likes.length} likes
          </p>

          {/* Caption */}
          <p className="px-4 py-2 text-sm">
            <b>{post.author?.username}</b> {post.caption}
          </p>

          {/* COMMENTS */}
          {showCommentsBox && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              ref={commentRef}
              className="px-4 pb-4"
            >
              <h3 className="font-semibold text-gray-700 mb-2">Comments</h3>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {post.comments?.map((c) => (
                  <div key={c._id} className="flex items-start gap-2">
                    <img
                      src={c.user?.profilePic || defaultPic}
                      className="w-8 h-8 rounded-full"
                      alt=""
                    />
                    <div className="bg-gray-100 px-3 py-2 rounded-xl">
                      <p className="text-sm">
                        <b>{c.user.username}</b> {c.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Comment */}
              <div className="flex items-center gap-2 mt-3">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-3 py-2 bg-gray-100 rounded-full text-sm outline-none"
                />

                <button
                  onClick={addComment}
                  className={`text-blue-600 font-semibold ${
                    commentText.trim() ? "" : "opacity-40"
                  }`}
                >
                  Post
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
