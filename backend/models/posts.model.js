import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  body: { type: String, required: true },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  media: {
    url: { type: String, default: "" },
    publicId: { type: String, default: "" },
    fileType: { type: String, default: "" },
  },
  active: { type: Boolean, default: true },
});

const Post = mongoose.model("Post", PostSchema);

export default Post;
