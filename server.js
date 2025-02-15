import express from "express"
import authRoutes from "./routes/user.routes.js"
import dotenv from "dotenv";
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import cookieParser from "cookie-parser"
import cors from "cors";
const app = express();

dotenv.config();
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
app.use(express.json({
  limit: "16kb"
}));
app.use(express.urlencoded({extended:true, limit: "16kb"}));
app.use(express.static("public"));
app.use(cookieParser());

mongoose
  .connect(`${process.env.MONGO_URI}/${DB_NAME}`)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));
app.get("/api", authRoutes);

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is listening on port: http://localhost:${port}`)
})