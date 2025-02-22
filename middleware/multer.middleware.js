import multer from "multer"

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/temp"); 
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

// Multer Upload Middleware
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// export const upload = multer({ storage });

// export {upload}
