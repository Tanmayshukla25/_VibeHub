import express from "express";
import Conversation from "../models/Conversation.js";
import { getSinglePost, sendPostController } from "../controllers/sendPostController.js";
import { verifyToken } from "../middleware/CheckToken.js";

const router = express.Router();

// ✅ Start or get an existing conversation
router.post("/start", async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    if (!senderId || !receiverId) {
      return res.status(400).json({ message: "Both user IDs are required" });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    })
      .populate("participants", "username name profilePic")
      .populate("messages.sender", "username name profilePic");

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, receiverId],
        messages: [],
      });
      await conversation.save();
    }

    res.status(200).json(conversation);
  } catch (error) {
    console.error("❌ Error starting chat:", error);
    res
      .status(500)
      .json({ message: "Error starting chat", error: error.message });
  }
});

// ✅ Get conversation by ID
// router.get("/:conversationId", async (req, res) => {
//   try {
//     const { conversationId } = req.params;

//     const conversation = await Conversation.findById(conversationId)
//       .populate("participants", "username name profilePic")
//       .populate("messages.sender", "username name profilePic");

//     if (!conversation)
//       return res.status(404).json({ message: "Conversation not found" });

//     // ✅ Sort messages oldest → newest
//     conversation.messages.sort(
//       (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
//     );

//     res.status(200).json(conversation);
//   } catch (error) {
//     console.error("❌ Error fetching conversation:", error);
//     res.status(500).json({
//       message: "Error fetching conversation",
//       error: error.message,
//     });
//   }
// });


router.get("/:conversationId", async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId)
      .populate("participants", "username name profilePic")
      .populate("messages.sender", "username name profilePic")
      .populate({
        path: "messages.postId",
        select: "media caption author",
        populate: { path: "author", select: "username profilePic" }
      });

    if (!conversation)
      return res.status(404).json({ message: "Conversation not found" });

    // sort messages
    conversation.messages.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    res.status(200).json(conversation);
  } catch (error) {
    console.error("❌ Error fetching conversation:", error);
    res.status(500).json({
      message: "Error fetching conversation",
      error: error.message,
    });
  }
});

// ✅ Get all conversations for a user
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "username name profilePic")
      .populate("messages.sender", "username name profilePic")
      .sort({ updatedAt: -1 });

    if (!conversations || conversations.length === 0) {
      return res.status(200).json([]); // no chats yet
    }

    // ✅ Add lastMessage info for UI preview
    const formattedConversations = conversations.map((conv) => {
      const lastMsg = conv.messages[conv.messages.length - 1];
      return {
        ...conv.toObject(),
        lastMessage: lastMsg
          ? {
              text: lastMsg.text,
              type: lastMsg.type,
              fileUrl: lastMsg.fileUrl,
              fileType: lastMsg.fileType,
              createdAt: lastMsg.createdAt,
            }
          : null,
      };
    });

    res.status(200).json(formattedConversations);
  } catch (error) {
    console.error("❌ Error fetching user conversations:", error);
    res.status(500).json({
      message: "Error fetching user conversations",
      error: error.message,
    });
  }
});

router.post("/send-post", verifyToken, sendPostController);
router.post("/send-post", verifyToken, getSinglePost);
export default router;
