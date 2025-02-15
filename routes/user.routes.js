import express from "express";
import { googleAuth, registerUser, updateAvatar } from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/auth.js"; // Ensure user is logged in

const router = express.Router();

router.post("/signup", registerUser)
router.post("/google-auth", googleAuth);
router.put("/update-avatar", verifyToken, updateAvatar);

export default router;
