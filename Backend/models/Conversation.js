import mongoose from "mongoose";

const messageSubSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String },
    fileUrl: { type: String },
    fileType: { type: String },
    fileName: { type: String },
  },
  { timestamps: true }
);

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
    messages: [messageSubSchema],
  },
  { timestamps: true }
);

// ✅ Non-unique index (allow multiple conversations)
conversationSchema.index({ participants: 1 }, { unique: false });

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;
