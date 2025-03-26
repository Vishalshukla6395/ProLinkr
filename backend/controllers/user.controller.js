import axios from "axios";
import crypto from "crypto";
import bcrypt from "bcrypt";
import PDFDocument from "pdfkit";
import stream from "stream";
import { promisify } from "util";
import User from "../models/user.model.js";
import Post from "../models/posts.model.js";
import Profile from "../models/profile.model.js";
import Comment from "../models/comments.model.js";
import ConnectionRequest from "../models/connections.model.js";
import { cloudinary } from "../cloudConfig.js";

const pipeline = promisify(stream.pipeline);

const fetchImageBuffer = async (url) => {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  return Buffer.from(response.data, "binary");
};

export const convertUserDataToPdf = async (userData) => {
  const doc = new PDFDocument({ margin: 50 });
  let buffers = [];
  doc.on("data", (data) => buffers.push(data));
  const finishPromise = new Promise((resolve, reject) => {
    doc.on("end", resolve);
    doc.on("error", reject);
  });

  const imageUrl = userData.userId.profilePicture?.url || "";
  let imageBuffer;
  try {
    if (imageUrl) {
      imageBuffer = await fetchImageBuffer(imageUrl);
    } else {
      imageBuffer = null;
    }
  } catch (error) {
    imageBuffer = null;
  }
  doc
    .fillColor("#0A66C2")
    .font("Helvetica-Bold")
    .fontSize(18)
    .text("User Profile", { align: "center" });
  doc.moveDown(1);
  if (imageBuffer) {
    doc.image(imageBuffer, 50, doc.y, { width: 80, height: 80 });
  }
  doc.moveDown(1.5);
  const textStartX = 150;
  doc
    .fillColor("black")
    .font("Helvetica-Bold")
    .fontSize(14)
    .text("Name: ", textStartX, doc.y, { continued: true });
  doc.font("Helvetica").text(userData.userId.name || "N/A");
  doc
    .font("Helvetica-Bold")
    .text("Username: ", textStartX, doc.y, { continued: true });
  doc.font("Helvetica").text(userData.userId.username || "N/A");
  doc
    .font("Helvetica-Bold")
    .text("Email: ", textStartX, doc.y, { continued: true });
  doc.font("Helvetica").text(userData.userId.email || "N/A");
  doc.moveDown(1);
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(1);
  doc.fillColor("#0A66C2").font("Helvetica-Bold").text("Bio:");
  doc
    .fillColor("black")
    .font("Helvetica")
    .text(userData.bio || "N/A");
  doc.moveDown(1);
  doc.fillColor("#0A66C2").font("Helvetica-Bold").text("Current Position:");
  doc
    .fillColor("black")
    .font("Helvetica")
    .text(userData.currentPost || "N/A");
  doc.moveDown(1);
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(1);
  doc.fillColor("#0A66C2").font("Helvetica-Bold").text("Past Work Experience:");
  doc.moveDown(0.5);
  if (userData.pastWork && userData.pastWork.length > 0) {
    userData.pastWork.forEach((work) => {
      doc
        .fillColor("black")
        .font("Helvetica-Bold")
        .text(`• ${work.company || "N/A"}`, { indent: 20 });
      doc
        .font("Helvetica")
        .text(`  Position: ${work.position || "N/A"}`, { indent: 20 });
      doc
        .font("Helvetica")
        .text(`  Years: ${work.years || "N/A"}`, { indent: 20 });
      doc.moveDown(0.5);
    });
  } else {
    doc
      .fillColor("black")
      .font("Helvetica")
      .text("No past work experience available.", { indent: 20 });
  }
  doc.end();
  await finishPromise;
  const pdfBuffer = Buffer.concat(buffers);

  const uploadResult = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "raw", folder: "pdfs" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    const passthrough = new stream.PassThrough();
    passthrough.end(pdfBuffer);
    passthrough.pipe(uploadStream);
  });
  return uploadResult.secure_url;
};

export const register = async (req, res) => {
  try {
    const { name, email, password, username } = req.body;
    if (!name || !email || !password || !username)
      return res.status(400).json({ message: "All fields are required" });
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(409).json({ message: "User already exists" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      username,
    });
    await newUser.save();
    const profile = new Profile({ userId: newUser._id });
    await profile.save();
    return res.json({ message: "User created" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "All fields are required" });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User does not exist" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });
    const token = crypto.randomBytes(32).toString("hex");
    await User.updateOne({ _id: user._id }, { token });
    return res.json({ token });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const uploadProfilePicture = async (req, res) => {
  const { token } = req.body;
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const user = await User.findOne({ token });
    if (!user) return res.status(404).json({ message: "User not found" });
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
    console.error("Error uploading profile picture:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  const { token, ...newUserData } = req.body;
  try {
    const user = await User.findOne({ token });
    if (!user) return res.status(404).json({ message: "User not found" });
    const { email, username } = newUserData;
    if (email || username) {
      const existingUser = await User.findOne({
        $or: [{ username }, { email }],
      });
      if (existingUser && String(existingUser._id) !== String(user._id))
        return res.status(400).json({ message: "User already exists" });
    }
    Object.assign(user, newUserData);
    await user.save();
    return res.json({ message: "User updated" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getUserAndProfile = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: "Token is required" });
    const user = await User.findOne({ token });
    if (!user) return res.status(404).json({ message: "User not found" });
    const userProfile = await Profile.findOne({ userId: user._id }).populate(
      "userId",
      "name email username profilePicture"
    );
    return res.json(userProfile);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateProfileData = async (req, res) => {
  try {
    const { token, ...newProfileData } = req.body;
    const user = await User.findOne({ token });
    if (!user) return res.status(404).json({ message: "User not found" });
    const profileToUpdate = await Profile.findOne({ userId: user._id });
    if (!profileToUpdate)
      return res.status(404).json({ message: "Profile not found" });
    Object.assign(profileToUpdate, newProfileData);
    await profileToUpdate.save();
    return res.json({ message: "Profile updated" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAllUserProfile = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }
    const currentUser = await User.findOne({ token });
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }
    const profiles = await Profile.find({
      userId: { $ne: currentUser._id },
    }).populate("userId", "name email username profilePicture");
    return res.json({ profiles });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const downloadProfile = async (req, res) => {
  try {
    const user_id = req.query.id;
    if (!user_id)
      return res.status(400).json({ message: "User id is required" });
    const userProfile = await Profile.findOne({ userId: user_id }).populate(
      "userId",
      "name email username profilePicture"
    );
    if (!userProfile)
      return res.status(404).json({ message: "Profile not found" });
    let pdfUrl = await convertUserDataToPdf(userProfile);
    return res.json({ message: pdfUrl });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const sendConnectionRequest = async (req, res) => {
  const { token, connectionId } = req.body;
  try {
    if (!token || !connectionId)
      return res
        .status(400)
        .json({ message: "Token and connectionId are required" });
    const user = await User.findOne({ token });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user._id.toString() === connectionId)
      return res
        .status(400)
        .json({ message: "Cannot send connection request to yourself" });
    const connectionUser = await User.findOne({ _id: connectionId });
    if (!connectionUser)
      return res.status(404).json({ message: "Connection user not found" });
    const existingRequest = await ConnectionRequest.findOne({
      userId: user._id,
      connectionId: connectionUser._id,
    });
    if (existingRequest)
      return res.status(400).json({ message: "Request already sent" });
    const request = new ConnectionRequest({
      userId: user._id,
      connectionId: connectionUser._id,
    });
    await request.save();
    return res.json({ message: "Request sent" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const myConnectionRequests = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token)
      return res.status(401).json({ message: "Unauthorized: Token required" });
    const user = await User.findOne({ token }).lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    const connections = await ConnectionRequest.find({ userId: user._id })
      .populate("connectionId", "name email username profilePicture")
      .lean();
    return res.json({ connections });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const myConnections = async (req, res) => {
  const { token } = req.query;
  try {
    if (!token)
      return res.status(401).json({ message: "Unauthorized: Token required" });
    const user = await User.findOne({ token });
    if (!user) return res.status(404).json({ message: "User not found" });
    const connections = await ConnectionRequest.find({
      connectionId: user._id,
    }).populate("connectionId", "name email username profilePicture");
    return res.json({ connections });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const acceptConnectionRequest = async (req, res) => {
  const { token, requestId, action_type } = req.body;
  try {
    if (!token || !requestId || !action_type)
      return res
        .status(400)
        .json({ message: "Token, requestId and action_type are required" });
    const user = await User.findOne({ token });
    if (!user) return res.status(404).json({ message: "User not found" });
    const connection = await ConnectionRequest.findOne({ _id: requestId });
    if (!connection)
      return res.status(404).json({ message: "Connection not found" });
    if (connection.connectionId.toString() !== user._id.toString())
      return res
        .status(403)
        .json({ message: "Not authorized to update this connection request" });
    if (action_type === "accept") {
      connection.status_accepted = true;
    } else if (action_type === "reject") {
      connection.status_accepted = false;
    } else {
      return res.status(400).json({ message: "Invalid action_type" });
    }
    await connection.save();
    return res.json({ message: "Request updated" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const commentPost = async (req, res) => {
  const { token, post_id, commentBody } = req.body;
  try {
    if (!token || !post_id || !commentBody)
      return res
        .status(400)
        .json({ message: "Token, post_id and commentBody are required" });
    const user = await User.findOne({ token }).select("_id");
    if (!user) return res.status(404).json({ message: "User not found" });
    const post = await Post.findOne({ _id: post_id });
    if (!post) return res.status(404).json({ message: "Post not found" });
    const comment = new Comment({
      userId: user._id,
      postId: post_id,
      body: commentBody,
    });
    await comment.save();
    return res.status(200).json({ message: "Comment added" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const get_comments_by_post = async (req, res) => {
  const { post_id } = req.body;
  try {
    if (!post_id)
      return res.status(400).json({ message: "Post id is required" });
    const post = await Post.findOne({ _id: post_id });
    if (!post) return res.status(404).json({ message: "Post not found" });
    const comments = await Comment.find({ postId: post_id }).populate(
      "userId",
      "username name profilePicture"
    );
    return res.json(comments.reverse());
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteComment = async (req, res) => {
  const { token, comment_id } = req.body;
  try {
    if (!token || !comment_id)
      return res
        .status(400)
        .json({ message: "Token and comment_id are required" });
    const user = await User.findOne({ token }).select("_id");
    if (!user) return res.status(404).json({ message: "User not found" });
    const comment = await Comment.findOne({ _id: comment_id });
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    if (comment.userId.toString() !== user._id.toString())
      return res.status(401).json({ message: "Unauthorized" });
    await Comment.deleteOne({ _id: comment_id });
    return res.json({ message: "Comment deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getProfileByUsername = async (req, res) => {
  const { username } = req.query;
  try {
    if (!username)
      return res.status(400).json({ message: "Username is required" });
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });
    const userProfile = await Profile.findOne({ userId: user._id }).populate(
      "userId",
      "name username email profilePicture"
    );
    return res.json({ profile: userProfile });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
