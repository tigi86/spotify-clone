import { v2 as cloudinary } from "cloudinary";
import albumModel from "../models/albumModel.js";

const addAlbum = async (req, res) => {
  try {
    const { name, desc, bgColor } = req.body;

    // Validate required fields
    if (!name || !desc || !bgColor) {
      return res.status(400).json({
        success: false,
        message: "Name, description and background color are required",
      });
    }

    // Validate image file exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Album image is required",
      });
    }

    // Upload image to Cloudinary
    const imageUpload = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          folder: "album_covers", // Optional: organize in Cloudinary
          transformation: [{ width: 500, height: 500, crop: "fill" }], // Optional: resize
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      // Use buffer instead of file path for better reliability
      uploadStream.end(req.file.buffer);
    });

    // Create album document
    const album = await albumModel.create({
      name,
      desc,
      bgColor,
      image: imageUpload.secure_url,
    });

    res.status(201).json({
      success: true,
      message: "Album added successfully",
      album,
    });
  } catch (error) {
    console.error("Error adding album:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to add album",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

const listAlbum = async (req, res) => {
  try {
    const allAlbums = await albumModel.find({}).sort({ createdAt: -1 }); // Newest first
    res.json({
      success: true,
      count: allAlbums.length,
      albums: allAlbums,
    });
  } catch (error) {
    console.error("Error listing albums:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve albums",
    });
  }
};

const removeAlbum = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Album ID is required",
      });
    }

    // Optional: Delete image from Cloudinary first
    const album = await albumModel.findById(id);
    if (album?.image) {
      const publicId = album.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`album_covers/${publicId}`);
    }

    const deletedAlbum = await albumModel.findByIdAndDelete(id);

    if (!deletedAlbum) {
      return res.status(404).json({
        success: false,
        message: "Album not found",
      });
    }

    res.json({
      success: true,
      message: "Album removed successfully",
    });
  } catch (error) {
    console.error("Error removing album:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove album",
    });
  }
};

export { addAlbum, listAlbum, removeAlbum };
