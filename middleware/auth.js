import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken || 
      req.header("Authorization")?.replace("Bearer ", "");

    console.log("🔹 Extracted Token:", token);

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized request" });
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    req.user = decodedToken; // ✅ Store user data
    next();
  } catch (error) {
    console.error("❌ Token Verification Failed:", error.message);
    return res.status(401).json({ success: false, message: "Invalid Access Token" });
  }
};
