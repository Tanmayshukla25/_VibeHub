import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const verifyToken = (req, res, next) => {
  try {
    console.log("🔹 Incoming cookies:", req.cookies);

    const token = req.cookies.userToken;
    console.log("🔹 Extracted Token:", token);

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🔹 Decoded Token:", decoded);

    req.user = {
      id: decoded.id,
      email: decoded.email,
      username: decoded.username,
    };

    next();
  } catch (error) {
    console.error("❌ JWT Verification Error:", error.message);
    res.status(403).json({ message: "Invalid or expired token" });
  }
};
