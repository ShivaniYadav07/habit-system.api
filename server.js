import express from "express"
import authRoutes from "./routes/user.routes.js"
import dotenv from "dotenv";
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
const app = express();

dotenv.config();
// app.use(express.json());
// app.use(cors());

mongoose
  .connect(`${process.env.MONGO_URI}/${DB_NAME}`)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));
app.get("/api", authRoutes);

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is listening on port: http://localhost:${process.env.PORT}`)
})