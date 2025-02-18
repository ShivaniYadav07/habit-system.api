import express from "express";
import { googleAuth, registerUser } from "../controllers/user.controller.js";
// import { verifyToken } from "../middleware/auth.js"; // Ensure user is logged in
// import {upload} from "../middleware/multer.middleware.js"
const router = express.Router();

router.route("/register").post(registerUser)
router.post("/google", googleAuth);
// router.put("/update-avatar", verifyToken, updateAvatar);

export default router;
