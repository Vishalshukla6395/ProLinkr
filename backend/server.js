import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import multer from "multer";
import { storage } from "./cloudConfig.js";
import userRoutes from "./routes/user.routes.js";
import postRoutes from "./routes/post.routes.js";
import User from "./models/user.model.js";

dotenv.config();
const PORT = process.env.PORT || 8080;
const app = express();

app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer({ storage });

app.post(
  "/update_profile_picture",
  upload.single("profile_picture"),
  async (req, res) => {
    const { token } = req.body;
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const user = await User.findOne({ token });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.profilePicture = {
        url: req.file.path,
        public_id: req.file.filename,
      };
      await user.save();
      return res.json({
        message: "Profile picture updated",
        url: req.file.path,
      });
    } catch (error) {
      console.error("Error updating profile picture:", error);
      return res.status(500).json({ message: error.message });
    }
  }
);

app.use(postRoutes);
app.use(userRoutes);

mongoose
  .connect(process.env.ATLASDB_URL)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });
