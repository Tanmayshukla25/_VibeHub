import express from "express";
import cors from "cors";
import userRouter from "./routes/userRoutes.js";
import followRouter from "./routes/followRoutes.js";
import "dotenv/config";
import connectToDB from "./config/db.js";
import cookieParser from "cookie-parser";
const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "https://vibehub-1-c4lj.onrender.com", 
  "http://localhost:5173",
];

const localhostRegex = /^http:\/\/localhost(:\d+)?$/;
  

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || localhostRegex.test(origin)) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["set-cookie"],
};
app.use(cookieParser());
app.use(cors(corsOptions));

app.use(express.json());
app.use("/user", userRouter);
app.use("/follow", followRouter);


await connectToDB();


app.listen(PORT, () => {
  console.log(` Server is running on port ${PORT}`);
});
