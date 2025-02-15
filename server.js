import express from "express"
import authRoutes from "./routes/user.routes.js"
const app = express();

// app.use(express.json());
// app.use(cors());
app.get("/api", authRoutes);

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is listening on port: http://localhost:${port}`)
})