import { User } from "../models/user.model.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import bcrypt from "bcrypt"
import {ApiError} from "../utils/ApiError.js"
import jwt from "jsonwebtoken"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js"

const generateAccessandRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const accessToken = user.generateAccessToken(); // Now works!
    const refreshToken = user.generateRefreshToken(); // Now works!

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Token Generation Error:", error);
    throw new ApiError(500, "Something went wrong while generating refresh and access token");
  }
};

export const registerUser = asyncHandler(async (req, res) => {
  try {
    const { username, email, gender, avatar, password } = req.body;

    let user = await User.findOne({ email }).select("+password");
    if (user)
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    user = await User.create({
      username,
      email,
      gender,
      avatar: gender === 'male' ? 'Male Avatar' : 'Female Avatar',
      password,
      password: hashedPassword,
    });

    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d', // Expiration time for token (7 days here)
    });

    res.status(200).json({
      success: true,
      message: "Register Successful",
      token: jwtToken, // Send token in response
      user, // You can send user data too
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
  });
  
  export const login = asyncHandler(async (req,res, next) => {
    try {
      const { email, password } = req.body;
  
      const user = await User.findOne({ email }).select("+password");
      if (!user) 
        return res
      .status(400)
      .json({ success: false, message: "User not exists" });
  
      const isMatched = await bcrypt.compare(password, user.password);
      if (!isMatched) 
        return res
      .status(400)
      .json({ success: false, message: "Wrong credentials" });
  
      const {accessToken, refreshToken} = await generateAccessandRefreshToken(user._id)

      const loggedInUser = await User.findById(user._id).select("-password -refrshToken")

      const options = {
        httpOnly: true,
        secure: true
      }
      const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '7d', 
      });
  
      return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
           {
          user: loggedInUser,
           token: jwtToken,
        },
        "User loggedIn Successfull"
      )
      );
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  })

  export const logout = asyncHandler(async(req, res) => {
    try {
      await User.findByIdAndUpdate(
        req.user._id,
        {
          $set: {
            refreshToken: undefined
          }
        },
        {
          new: true
        }
      )
      const options = {
        httpOnly: true,
        secure: true
      }
  
      return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "User logged Out"))
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
   })

  export const uploadAvatar = asyncHandler(async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
  
        // Upload the file to Cloudinary
        const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
  
        if (!cloudinaryResponse) {
          return res.status(500).json({ success: false, message: 'Failed to upload to Cloudinary' });
        }
  
        const avatarUrl = cloudinaryResponse.url;  // Cloudinary provides the URL in response
  
        // Log the user ID to confirm it's correct
        console.log('User ID from token:', req.user._id);
  
        // Find the user by ID
        const user = await User.findById(req.user._id);
  
        if (!user) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }
  
        // Update the user's avatar URL
        user.avatar = avatarUrl;
  
        // Save the updated user data
        await user.save();
  
        res.status(200).json({
          success: true,
          message: 'Avatar uploaded successfully',
          avatar: avatarUrl,
        });
      } catch (error) {
        console.error('Error uploading avatar:', error);
        res.status(500).json({ success: false, message: 'Server error, please try again' });
      }
  });
  
  export const googleAuth = asyncHandler(async (req, res) => {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ success: false, message: "Token is required" });
      }
  
      // Verify Google token
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
  
      const { username, email, picture, sub: googleId } = ticket.getPayload();
  
      let user = await User.findOne({ email });
  
      if (!user) {
        user = await User.create({
          username,
          email,
          googleId,
          avatar: picture || null,
        });
      }
  
      // Generate JWT token
      const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
  
      res.status(200).json({
        success: true,
        message: "Google authentication successful",
        token: jwtToken,
        user,
      });
    } catch (error) {
      console.error("Google Auth Error:", error);
      res.status(500).json({ success: false, message: "Google authentication failed" });
    }
  }); 

  export const refreshAccessToken = asyncHandler(async (req,res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(incomingRefreshToken) {
      throw new ApiError(401, "unauthorized request")
    }
    try {
      const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
      )
      const user = await User.findById(decodedToken?._id)
      if (!user) {
        throw new ApiError(401, "Invalid refresh token")
      }
      if(incomingRefreshToken !== user?.refreshToken)
      {
        throw new ApiError(401, "Refresh token is expired or used")
      }
      const options = {
        httpOnly: true,
        secure: true
      }
      const {accessToken, newRefreshToken} = await
      generateAccessandRefreshToken(user._id)

      return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {accessToken, refreshToken:
            newRefreshToken
          },
          "Access token refreshed"
        )
      )
    } catch (error) {
      throw new ApiError(401, error?.message || "Invalid refresh token")
    }
  })