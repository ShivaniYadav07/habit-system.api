import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

export const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto", // This will automatically detect file types (images, videos, etc.)
    });
    
    console.log("file is uploaded on Cloudinary", response.url);
    return response;
  } catch (error) {
    console.error("Cloudinary upload error:", error);  // Log the full error
    fs.unlinkSync(localFilePath);  // Clean up the file from local storage if it was uploaded
    return null;
  }
};
