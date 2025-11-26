import Conversation from "../models/Conversation.js";
import Post from "../models/postSchema.js";

// export const sendPostController = async (req, res) => {
//   try {
//     const { receiverId, postId } = req.body;
//     const senderId = req.user.id; // middleware required (verifyToken)

//     if (!receiverId || !postId) {
//       return res.status(400).json({ message: "Missing receiver or postId" });
//     }

//     let conversation = await Conversation.findOne({
//       participants: { $all: [senderId, receiverId] }
//     });

//     if (!conversation) {
//       conversation = await Conversation.create({
//         participants: [senderId, receiverId],
//         messages: []
//       });
//     }

//     const newMessage = {
//       sender: senderId,
//       type: "post",
//       text: "Sent a post",
//       postId
//     };

//     conversation.messages.push(newMessage);
//     await conversation.save();

//     return res.json({
//       success: true,
//       chatId: conversation._id,
//       message: "Post sent successfully"
//     });
//   } catch (err) {
//     console.log("Send post error:", err);
//     return res.status(500).json({ error: "Server error" });
//   }
// };

export const sendPostController = async (req, res) => {
  try {
    const { receiverId, postId } = req.body;
    const senderId = req.user.id;

    if (!receiverId || !postId) {
      return res.status(400).json({ message: "Missing receiver or postId" });
    }

    // Ensure post exists
    const post = await Post.findById(postId).lean();
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Find conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        messages: []
      });
    }

    // Add message
    conversation.messages.push({
      sender: senderId,
      type: "post",
      text: "",
      postId
    });

    await conversation.save();

    // ⭐ Populate the LAST message with full post details
    const populatedConv = await Conversation.findById(conversation._id)
      .populate("messages.sender", "username profilePic")
      .populate({
        path: "messages.postId",
        select: "media caption author",
        populate: { path: "author", select: "username profilePic" }
      });

    const populatedMessage =
      populatedConv.messages[populatedConv.messages.length - 1];

    // ⭐ Send back message object to FE
    return res.json({
      success: true,
      chatId: conversation._id,
      message: populatedMessage,
    });

  } catch (err) {
    console.log("Send post error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};


export const getSinglePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "username profilePic") // ⭐ IMPORTANT
      .populate("comments.user", "username profilePic"); // ⭐ For comments

    if (!post) return res.status(404).json({ message: "Post not found" });

    return res.status(200).json({ post });
  } catch (err) {
    console.log("Single post fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
