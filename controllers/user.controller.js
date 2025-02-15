import { User } from "../models/user.model.js";

export const registerUser = async (req, res) => {
    try {
      const { name, email, password } = req.body;
  
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: "User already exists" });
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newUser = new User({ name, email, password: hashedPassword });
      await newUser.save();
  
      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  };
  
  export const googleAuth = async (req, res) => {
    try {
      const { name, email, googleId, avatar } = req.body;
  
      let user = await User.findOne({ email });
  
      if (!user) {
        user = new User({ name, email, googleId, avatar: null }); // Avatar initially null
        await user.save();
      }
  
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  
      res.json({ token, user });
    } catch (error) {
      res.status(500).json({ message: "Google authentication failed" });
    }
  };

  export const updateAvatar = async (req, res) => {
    try {
      const { avatar } = req.body; // Avatar URL ya Base64 image lega
      const userId = req.user.id; // JWT middleware se user ID milega
  
      if (!avatar) return res.status(400).json({ message: "Avatar is required" });
  
      const user = await User.findByIdAndUpdate(userId, { avatar }, { new: true });
  
      res.json({ message: "Avatar updated successfully", user });
    } catch (error) {
      res.status(500).json({ message: "Error updating avatar" });
    }
  };
  
  