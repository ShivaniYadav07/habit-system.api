const mongoose = require("mongoose");

const habitSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        name: {
            type: String,
            required: true
        }, 
        description: {
            type: String,
            default: ""
        },
        frequency: {
            type: String,
            enum: ["daily", "weekly", "custom"],
            required: true
        },
        streak: {
            type: Number,
            default: 0
        }, 
        reminders: [{
            type: String
        }], 
        progress: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "HabitProgress"
        }],
        createdAt: {
            type: Date,
            default: Date.now
        },
    },
    { timestamps: true }
);

export const Habit = mongoose.model("Habit", habitSchema);
