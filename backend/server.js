import express from "express";
import cors from "cors";
import "dotenv/config";
import songRouter from "./src/routes/songRoute.js";
import connectDB from "./src/config/mogodb.js";
import connectCloudinary from "./src/config/cloudinary.js";
import albumRouter from "./src/routes/albumRoute.js";

// const express = require("express");
// const cors = require("cors");
const app = express();

// ✅ Enable CORS for all domains (or specify only your frontend domain)
app.use(
  cors({
    origin: "https://spotify-clone-frontend-ll6e.onrender.com",
    credentials: true, // if you use cookies or auth
  })
);
// app config

const port = process.env.PORT || 4000;
connectDB();
connectCloudinary();

// middleware
app.use(express.json());
app.use(cors());

// initialzing routes
app.get("/", (req, res) => res.send("API working"));
app.use("/api/song", songRouter);
app.use("/api/album", albumRouter);

app.listen(port, () => console.log(`server started on ${port}`));
