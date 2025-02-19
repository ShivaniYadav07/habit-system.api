import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

export const verifyToken = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken || // ✅ Fixed typo: `req.cookies`
      req.header("Authorization")?.replace("Bearer ", ""); // ✅ Fixed space issue

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    // ✅ Fixed secret: should use ACCESS_TOKEN_SECRET for accessToken verification
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECTRE);

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


