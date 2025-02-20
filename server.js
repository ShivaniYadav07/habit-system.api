import express from "express"
import authRoutes from "./routes/user.routes.js"
import dotenv from "dotenv";
import cookieParser from "cookie-parser"
import cors from "cors";
import connectedToDb from "./db/db.js";
import passport from "passport";
import session from "express-session";
import habitRoutes from "./routes/habit.routes.js";
import habitProgressRoutes from "./routes/habitProgress.routes.js"
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
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

connectedToDb()
app.use("/api/v1", authRoutes, habitRoutes, habitProgressRoutes);
app.get("/", (req, res) => {
  res.send("Server is working fine");
});
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is listening on port: http://localhost:${port}`)
})


