
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import http from "http";
import "dotenv/config";
import connectToDB from "./config/db.js";
import userRouter from "./routes/userRoutes.js";
import followRouter from "./routes/followRoutes.js";
import conversationRouter from "./routes/conversationRoutes.js";
import Conversation from "./models/Conversation.js";

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:5173",
  "https://vibehub-1-c4lj.onrender.com",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

app.use("/user", userRouter);
app.use("/follow", followRouter);
app.use("/conversation", conversationRouter);

await connectToDB();

const io = new Server(server, {
  cors: { origin: allowedOrigins, credentials: true },
});

io.on("connection", (socket) => {
  console.log("🟢 New client connected:", socket.id);

  // Join personal user room
  socket.on("join_user", (userId) => {
    socket.join(userId);
    console.log(`👤 User ${userId} joined personal room`);
  });

  // Join conversation room
  socket.on("join_conversation", (conversationId) => {
    socket.join(conversationId);
    console.log(`💬 Joined conversation ${conversationId}`);
  });

  // Handle sending messages
  socket.on("send_message", async (data) => {
    const { conversationId, sender, text, tempId } = data;

    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) return;

      const newMessage = { sender, text };
      conversation.messages.push(newMessage);
      await conversation.save();

      const populatedMsg = await Conversation.populate(newMessage, {
        path: "sender",
        select: "username name profilePic",
      });

      // ✅ Emit to both participants
      io.to(conversationId).emit("receive_message", {
        ...populatedMsg,
        conversationId,
        tempId,
      });

      // ✅ Also emit to receiver’s personal room for notifications
      conversation.participants.forEach((pId) => {
        if (pId.toString() !== sender.toString()) {
          io.to(pId.toString()).emit("receive_message_notification", {
            conversationId,
            sender,
            text,
          });
        }
      });
    } catch (err) {
      console.error("❌ Message error:", err.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 Disconnected:", socket.id);
  });
});

server.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
