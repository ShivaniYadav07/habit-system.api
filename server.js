import express from "express";
import authRoutes from "./routes/user.routes.js";
import habitRoutes from "./routes/habit.routes.js";
import habitProgressRoutes from "./routes/habitProgress.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectedToDb from "./db/db.js";
import passport from "passport";
import session from "express-session";
import functions from "firebase-functions";
import dotenv from "dotenv";

const app = express();
dotenv.config({
    path: "../.env",
  });
// ✅ Use Firebase Config Instead of process.env
const config = functions.config();

const CORS_ORIGIN = config?.cors?.origin;
const JWT_SECRET = config?.jwt?.secret ;
const PORT = config?.port;

app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use(
  session({
    secret: process.env.JWT_SECRET || "fallback_secret",
    resave: false,
    saveUninitialized: true,
  })
);


app.use(passport.initialize());
app.use(passport.session());

// ✅ Connect Database
connectedToDb();

// ✅ API Routes
app.use("/api/v1", authRoutes, habitRoutes, habitProgressRoutes);

app.get("/", (req, res) => {
  res.send("Server is working fine on Firebase Functions!");
});

// ✅ Firebase Function Export
export const api = functions.https.onRequest(app);
