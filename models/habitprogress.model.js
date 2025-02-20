import mongoose from "mongoose";


const habitProgressSchema = new mongoose.Schema(
    {
        habit: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Habit",
            required: true
        },
        date: {
            type: Date,
            required: true
        },
        completed: {
            type: Boolean,
            default: false
        },
    },
    { timestamps: true }
);

export const HabitProgress = mongoose.model("HabitProgress", habitProgressSchema);
