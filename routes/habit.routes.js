import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { createHabit, getUserHabits, updateHabit, completeHabit, deleteHabit } from "../controllers/habit.controller.js";

const router = express.Router();

router.post("/create", verifyToken, createHabit);
router.get("/", verifyToken, getUserHabits);
router.put("/update/:habitId", verifyToken, updateHabit);
router.put("/complete", verifyToken, completeHabit);
router.delete("/delete/:habitId", verifyToken, deleteHabit);

export default router;
