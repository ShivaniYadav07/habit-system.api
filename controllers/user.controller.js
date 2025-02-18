import { User } from "../models/user.model.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import bcrypt from "bcrypt"
import { OAuth2Client } from "google-auth-library";
import axios from "axios"
// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


export const registerUser = asyncHandler(async (req, res) => {
  try {
    const { username, email, gender, password } = req.body;

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
      password,
      password: hashedPassword,
    });

    res.status(200).json({
      success: true,
      message:
        "User Register Successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
  });
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
  // export const googleAuth = async (req, res) => {
  //   try {
  //     const { access_token } = req.body;
  //     if (!access_token) {
  //       return res.status(400).json({ success: false, message: "No access token provided" });
  //     }
  
  //     // Verify Google access token
  //     const tokenInfoResponse = await axios.get(
  //       `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${access_token}`
  //     );
  //     const userInfoResponse = await axios.get(
  //       `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${access_token}`
  //     );
  
  //     const tokenInfo = tokenInfoResponse.data;
  //     const userData = userInfoResponse.data;
  
  //     if (!tokenInfo || !userData) {
  //       return res.status(401).json({ success: false, message: "Invalid token" });
  //     }
  
  //     const { username, email, picture } = userData;
  //     if (!email) {
  //       return res.status(404).json({ success: false, message: "Email not found" });
  //     }
  
  //     const nameArray = name.split(" ");
  //     let user = await User.findOne({ email });
  
  //     if (!user) {
  //       // Create new user if not found
  //       user = await User.create({
  //         username,
  //         email,
  //         avatar: picture || null,
  //       });
  //     }
  
  //     // Generate JWT Token
  //     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
  //       expiresIn: "7d",
  //     });
  
  //     // Set Cookie (if needed)
  //     res.cookie("token", token, {
  //       httpOnly: true,
  //       secure: process.env.NODE_ENV === "production",
  //       maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  //     });
  
  //     res.status(200).json({
  //       success: true,
  //       message: user ? "Login Successful" : "Registered Successfully",
  //       token,
  //       user,
  //     });
  //   } catch (error) {
  //     console.error("Google Auth Error:", error);
  //     res.status(500).json({ success: false, message: "Authentication failed" });
  //   }
  // };
 
  
  