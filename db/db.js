import mongoose from "mongoose";
import functions from "firebase-functions"; // Firebase Config Access Karne Ke Liye
import dotenv from "dotenv";
const connectedToDb = async () => {
  dotenv.config({
    path: "../.env",
  });

  const MONGO_URI =
  process.env.MONGO_URI || functions.config().mongo?.uri;
  const DB_NAME = "habit_system";

  if (!MONGO_URI) {
    console.error("Mongo URI not found in Firebase Config!");
    return;
  }

  try {
    await mongoose.connect(`${MONGO_URI}/${DB_NAME}`);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
  }
};

export default connectedToDb;
