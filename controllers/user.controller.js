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

        user = await User.create({
      username,
      email,
      gender,
      avatar: gender === 'male' ? 'Male Avatar' : 'Female Avatar',
      password,  
      habits: [],  
      streak: 0,  
      longestStreak: 0, 
    });

    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(200).json({
      success: true,
      message: "Register Successful",
      token: jwtToken,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        gender: user.gender,
        avatar: user.avatar,
        habits: user.habits,
        streak: user.streak,
        longestStreak: user.longestStreak, 
        createdAt: user.createdAt,
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
});

  
export const login = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ User fetch karein aur password include karein
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ success: false, message: "User does not exist" });
    }
    console.log("Entered Password:", password);
    console.log("Stored Hashed Password:", user.password);
    
    const isMatched = await bcrypt.compare(password, user.password);
    console.log("Password Match Result:", isMatched);
    
    if (!isMatched) {
      return res.status(400).json({ success: false, message: "Wrong credentials" });
    }

    // 3️⃣ Tokens Generate Karein
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // 4️⃣ Secure Cookie Options
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    };

    // 5️⃣ User details password ke bina bhejein
    const loggedInUser = await User.findById(user._id)
      .select("-password -refreshToken");

    // 6️⃣ Response return karein
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        success: true,
        message: "User logged in successfully",
        user: loggedInUser,
        token: accessToken, // 🛑 Only Access Token, Refresh Token nahi bhejna JSON me
      });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
});


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