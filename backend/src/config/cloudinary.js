import { v2 as cloudinary } from "cloudinary";

const connectCloudinary = async () => {
  await cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
  });

  try {
    await cloudinary.api.ping();
    console.log("Connected to Cloudinary successfully");
  } catch (error) {
    console.error("Cloudinary connection error:", error);
  }
};

export default connectCloudinary;
