import User from "../models/user.model.js";
import Post from "../models/posts.model.js";

export const activeCheck = async (req, res) => {
  return res.status(200).json({ message: "RUNNING" });
};

export const createPost = async (req, res) => {
  const { token, body } = req.body;
  if (!token || !body) {
    return res
      .status(400)
      .json({ message: "Token and post body are required" });
  }

  try {
    const user = await User.findOne({ token });
    if (!user) return res.status(404).json({ message: "User not found" });

    let media = { url: "", publicId: "", fileType: "" };
    if (req.file) {
      media = {
        url: req.file.path,
        publicId: req.file.filename,
        fileType: req.file.mimetype.split("/")[1],
      };
    }

    const post = new Post({
      userId: user._id,
      body,
      media,
      fileType: media.fileType,
    });

    await post.save();
    return res.status(200).json({ message: "Post created" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const allPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate(
      "userId",
      "name username email profilePicture"
    );
    return res.json({ posts });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deletePost = async (req, res) => {
  const { token, post_id } = req.body;
  if (!token || !post_id)
    return res.status(400).json({ message: "Token and post_id are required" });
  try {
    const user = await User.findOne({ token }).select("_id");
    if (!user) return res.status(404).json({ message: "User not found" });
    const post = await Post.findOne({ _id: post_id });
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.userId.toString() !== user._id.toString())
      return res.status(401).json({ message: "Unauthorized" });
    await post.deleteOne();
    return res.json({ message: "Post deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const increaseLikes = async (req, res) => {
  const { post_id, user_id } = req.body;
  if (!post_id || !user_id)
    return res
      .status(400)
      .json({ message: "Post id and user id are required" });
  try {
    const post = await Post.findOne({ _id: post_id });
    if (!post) return res.status(404).json({ message: "Post not found" });
    post.likedBy = post.likedBy || [];
    if (post.likedBy.includes(user_id)) {
      post.likedBy = post.likedBy.filter(
        (id) => id.toString() !== user_id.toString()
      );
      post.likes = Math.max(post.likes - 1, 0);
      await post.save();
      return res.json({ message: "Post unliked", post });
    } else {
      post.likedBy.push(user_id);
      post.likes = post.likes + 1;
      await post.save();
      return res.json({ message: "Post liked", post });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
