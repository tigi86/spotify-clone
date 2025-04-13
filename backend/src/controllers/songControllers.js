import { v2 as cloudinary } from "cloudinary";
import songModel from "../models/songModel.js";

const addSong = async (req, res) => {
  try {
    const { name, desc, album } = req.body;

    // Validate files exist
    if (!req.files?.audio?.[0] || !req.files?.image?.[0]) {
      return res.status(400).json({
        success: false,
        message: "Both audio and image files are required",
      });
    }

    const audioFile = req.files.audio[0];
    const imageFile = req.files.image[0];

    // Validate file buffers exist
    if (!audioFile.buffer || !imageFile.buffer) {
      return res.status(400).json({
        success: false,
        message: "File buffers are empty - check multer configuration",
      });
    }

    // Upload audio to Cloudinary
    const audioUpload = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "video",
          chunk_size: 6000000, // 6MB chunks for better reliability
        },
        (error, result) => (error ? reject(error) : resolve(result))
      );

      // Write the buffer to the upload stream
      uploadStream.end(audioFile.buffer);
    });

    // Upload image to Cloudinary
    const imageUpload = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          chunk_size: 6000000,
        },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      uploadStream.end(imageFile.buffer);
    });

    // Calculate duration (MM:SS format)
    const minutes = Math.floor(audioUpload.duration / 60);
    const seconds = Math.floor(audioUpload.duration % 60)
      .toString()
      .padStart(2, "0");
    const duration = `${minutes}:${seconds}`;

    // Save to database
    const song = await songModel.create({
      name,
      desc,
      album,
      image: imageUpload.secure_url,
      audio: audioUpload.secure_url,
      duration,
    });

    res.status(201).json({
      success: true,
      message: "Song added successfully",
      song,
    });
  } catch (error) {
    console.error("Detailed upload error:", {
      message: error.message,
      stack: error.stack,
      ...(error.response && { response: error.response.data }),
    });

    res.status(500).json({
      success: false,
      message: error.message || "Failed to add song",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};
// ... rest of your controller functions
const listSong = async (req, res) => {
  try {
    const allSongs = await songModel.find({});
    res.json({ success: true, songs: allSongs });
  } catch (error) {
    res.json({ success: false });
  }
};

const removeSong = async (req, res) => {
  try {
    await songModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Song removed" });
  } catch (error) {
    res.json({ success: false });
  }
};

export { addSong, listSong, removeSong };
