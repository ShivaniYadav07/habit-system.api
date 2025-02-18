import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { _id: decoded.id };  // Use '_id' to match the field in your MongoDB
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

