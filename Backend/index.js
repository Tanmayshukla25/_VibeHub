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
import uploadRouter from "./routes/uploadRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
// 🆕 Import Post System
import postRouter from "./routes/postRoutes.js";
import uploadTempRoutes from "./routes/uploadTempRoutes.js"; // ✅ Added for post system
import storyRouter from "./routes/storyRoutes.js";

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
app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ limit: "500mb", extended: true }));

// ✅ Your existing routes
app.use("/user", userRouter);
app.use("/follow", followRouter);
app.use("/conversation", conversationRouter);
app.use("/upload", uploadRouter);
app.use("/ai", aiRoutes);
// ✅ Add Post Routes (new)
app.use("/post", postRouter); // 👈 This enables /post/create, /post/user/:id, /post (GET all)
app.use("/upload", uploadTempRoutes);
app.use("/story", storyRouter);
await connectToDB();

// ====================== SOCKET.IO SECTION ======================
const io = new Server(server, {
  cors: { origin: allowedOrigins, credentials: true },
});

// io.on("connection", (socket) => {
//   console.log("🟢 New client connected:", socket.id);

//   // Join personal user room
//   socket.on("join_user", (userId) => {
//     socket.join(userId);
//     console.log(`👤 User ${userId} joined personal room`);
//   });

//   // Join conversation room
//   socket.on("join_conversation", (conversationId) => {
//     socket.join(conversationId);
//     console.log(`💬 Joined conversation ${conversationId}`);
//   });

//   // Handle sending messages
//   socket.on("send_message", async (data) => {
//     const {
//       conversationId,
//       sender,
//       text,
//       tempId,
//       type,
//       fileUrl,
//       fileType,
//       fileName,
//       postId,
//     } = data;

//     try {
//       const conversation = await Conversation.findById(conversationId);
//       if (!conversation) return;

//       // ✅ Determine message type
//       const messageType =
//         type ||
//         (fileUrl
//           ? fileType?.startsWith("image")
//             ? "image"
//             : fileType?.startsWith("video")
//             ? "video"
//             : "file"
//           : "text");

//       // ✅ Build message
//       const newMessage = {
//         sender,
//         text: text || "",
//         type: messageType,
//         fileUrl: fileUrl || "",
//         fileType: fileType || "",
//         fileName: fileName || "",
//         postId: postId || null,
//       };

//       // ✅ Save message in DB
//       conversation.messages.push(newMessage);
//       await conversation.save();

//       // ✅ Fetch updated conversation with populated fields
//       const updatedConv = await Conversation.findById(conversationId)
//         .populate("participants", "username name profilePic")
//         .populate("messages.sender", "username name profilePic")
//         .populate({
//           path: "messages.postId",
//           select: "media caption author",
//           populate: { path: "author", select: "username profilePic" }
//         });

//       const populatedMsg = updatedConv.messages[updatedConv.messages.length - 1];

//       // ✅ Emit to users in the chat room
//       io.to(conversationId).emit("receive_message", {
//         ...populatedMsg.toObject(),
//         conversationId,
//         tempId,
//       });

//       // ✅ Notify other users
//       conversation.participants.forEach((pId) => {
//         if (pId.toString() !== sender.toString()) {
//           io.to(pId.toString()).emit("receive_message_notification", {
//             conversationId,
//             sender,
//             text,
//           });
//         }
//       });
//     } catch (err) {
//       console.error("❌ Message error:", err.message);
//     }
//   });

//   socket.on("disconnect", () => {
//     console.log("🔴 Disconnected:", socket.id);
//   });
// });

// ====================== SERVER START ======================

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

  // ⭐ REAL-TIME TYPING INDICATOR (NEW)
  socket.on("typing", ({ conversationId, senderId }) => {
    socket.to(conversationId).emit("typing", {
      senderId,
      conversationId,
    });
  });

  socket.on("stop_typing", ({ conversationId, senderId }) => {
    socket.to(conversationId).emit("stop_typing", {
      senderId,
      conversationId,
    });
  });

  // Handle sending messages
  socket.on("send_message", async (data) => {
    const {
      conversationId,
      sender,
      text,
      tempId,
      type,
      fileUrl,
      fileType,
      fileName,
      postId,
    } = data;

    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) return;

      // Determine message type
      const messageType =
        type ||
        (fileUrl
          ? fileType?.startsWith("image")
            ? "image"
            : fileType?.startsWith("video")
            ? "video"
            : "file"
          : "text");

      const newMessage = {
        sender,
        text: text || "",
        type: messageType,
        fileUrl: fileUrl || "",
        fileType: fileType || "",
        fileName: fileName || "",
        postId: postId || null,
      };

      conversation.messages.push(newMessage);
      await conversation.save();

      const updatedConv = await Conversation.findById(conversationId)
        .populate("participants", "username name profilePic")
        .populate("messages.sender", "username name profilePic")
        .populate({
          path: "messages.postId",
          select: "media caption author",
          populate: { path: "author", select: "username profilePic" },
        });

      const populatedMsg =
        updatedConv.messages[updatedConv.messages.length - 1];

      io.to(conversationId).emit("receive_message", {
        ...populatedMsg.toObject(),
        conversationId,
        tempId,
      });

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

server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
