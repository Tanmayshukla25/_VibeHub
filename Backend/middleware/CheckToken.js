import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {

    const token = req.cookies.userToken;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);
    res.status(403).json({ message: "Invalid or expired token" });
  }
};
