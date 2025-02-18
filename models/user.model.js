import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"
const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
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
        gender:{
            type: String,
            required: true,
            default: null,
        },
        streak: { 
            type: Number, 
            default: 0
        },
        avatar: {
            type: String,
            required: false,
            default: ""
        },
        refreshToken: {
            type: String
        },
        accessToken: {
            type: String
        }, 
        createdAt: {
            type: Date,
            default: Date.now
        },
    },
    { timestamps: true }
)

userSchema.pre("save", async function (next) {
    if(!this.isModified("password"))
        return next()
    this.password = bcrypt.hash(this.password, 10)
    next()
});

userSchema.method.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.method.generateAccessToken = function() {
    jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
)
}
userSchema.method.generateRefreshToken = function() {
    jwt.sign({
        _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
)
}
// userSchema.methods.comparePassword = async function (candidatePassword) {
//     try {
//       const hashedPassword = await new Promise((resolve, reject) => {
//         crypto.pbkdf2(
//           candidatePassword,
//           this.salt,
//           1000,
//           64,
//           "sha512",
//           (err, derivedKey) => {
//             if (err) reject(err);
//             resolve(derivedKey.toString("hex"));
//           }
//         );
//       });
  
//       return hashedPassword === this.password;
//     } catch (error) {
//       throw new Error("Error comparing password.");
//     }
//   };
//   userSchema.methods.getToken = async function () {
//     const resetToken = crypto.randomBytes(20).toString("hex");
  
//     this.resetPasswordToken = crypto
//       .createHash("sha256")
//       .update(resetToken)
//       .digest("hex");
  
//     this.resetTokenExpiry = Date.now() + 10 * 60 * 1000;
  
//     return resetToken;
//   };
  
export const User = mongoose.model("User", userSchema)