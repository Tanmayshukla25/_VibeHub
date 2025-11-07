import express from "express";
import Conversation from "../models/Conversation.js";

const router = express.Router();

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

    // ✅ If not found, create a new one
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
    res.status(500).json({ message: "Error starting chat", error: error.message });
  }
});

// ✅ Get conversation by ID
router.get("/:conversationId", async (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversation = await Conversation.findById(conversationId)
      .populate("participants", "username name profilePic")
      .populate("messages.sender", "username name profilePic");

    if (!conversation)
      return res.status(404).json({ message: "Conversation not found" });

    res.status(200).json(conversation);
  } catch (error) {
    console.error("❌ Error fetching conversation:", error);
    res.status(500).json({ message: "Error fetching conversation", error: error.message });
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

    res.status(200).json(conversations);
  } catch (error) {
    console.error("❌ Error fetching user conversations:", error);
    res.status(500).json({
      message: "Error fetching user conversations",
      error: error.message,
    });
  }
});

export default router;
