import express from "express";
import { googleAuth, login, registerUser, uploadAvatar } from "../controllers/user.controller.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyToken } from "../middleware/auth.js";
// import { verifyToken } from "../middleware/auth.js"; // Ensure user is logged in
// import {upload} from "../middleware/multer.middleware.js"
const router = express.Router();

router.route("/register").post(registerUser)
router.post("/google", googleAuth);
router.get("/login", login);
router.post('/upload-avatar', verifyToken, upload.single('avatar'), uploadAvatar);
// router.put("/update-avatar", verifyToken, updateAvatar);

export default router;
