import express from "express";
import cors from "cors";
import userRouter from "./routes/userRoutes.js";
import "dotenv/config";
import connectToDB from "./config/db.js";
import cookieParser from "cookie-parser";
const app = express();
const PORT = process.env.PORT || 5000;


const allowedOrigins = [
  process.env.FRONTEND_URL, 
];

const localhostRegex = /^http:\/\/localhost(:\d+)?$/;


const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); 
    if (allowedOrigins.includes(origin) || localhostRegex.test(origin)) {
      callback(null, true);
    } else {
      console.log(" Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
};
app.use(cookieParser());
app.use(cors(corsOptions));

app.use(express.json());
app.use("/user", userRouter);


await connectToDB();


app.listen(PORT, () => {
  console.log(` Server is running on port ${PORT}`);
});
