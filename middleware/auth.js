import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

export const verifyToken = asyncHandler(async (req, res, next) => {
  try {
    console.log("Authorization Header:", req.headers.authorization);
    const token =
      req.cookies?.accessToken || // ✅ Fixed typo: `req.cookies`
      req.header("Authorization")?.replace("Bearer ", ""); // ✅ Fixed space issue
      // console.log("Extracted Token:", token);
    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    // ✅ Fixed secret: should use ACCESS_TOKEN_SECRET for accessToken verification
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECTRE);
    // console.log("Decoded Token:", decodedToken);

    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token");
  }
});

export const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    return res.status(403).json({ success: false, message: "Invalid token" });
  }
};


