import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        googleId: {
            type: String,
            required: false,
            unique: true
        },
        avatar: {
            type: String,
            default: null
        }, 
        createdAt: {
            type: Date,
            default: Date.now
        },
    },
    { timestamps: true }
)

export const User = mongoose.model("User", userSchema)