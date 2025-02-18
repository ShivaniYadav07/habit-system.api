import { User } from "../models/user.model.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import bcrypt from "bcrypt"
import {ApiError} from "../utils/ApiError.js"
import setCookie from "../utils/setCookie.js";
import jwt from "jsonwebtoken"
// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


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
  
      const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '7d', // Expiration time for token (7 days here)
      });
  
      res.status(200).json({
        success: true,
        message: "Login Successful",
        token: jwtToken, // Send token in response
        user, // You can send user data too
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  })

  export const uploadAvatar = async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }
  
      // Get the uploaded image URL from the file path
      const avatarUrl = req.file.path;
  
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
  };
  
  
  export const googleAuth = async (req, res) => {
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
  }; 