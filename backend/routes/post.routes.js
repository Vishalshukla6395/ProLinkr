import { Router } from "express";
import multer from "multer";
import { storage } from "../cloudConfig.js";
import {
  activeCheck,
  allPosts,
  createPost,
  deletePost,
  increaseLikes,
} from "../controllers/posts.controller.js";
import {
  commentPost,
  deleteComment,
  get_comments_by_post,
} from "../controllers/user.controller.js";

const router = Router();

const upload = multer({ storage });

router.route("/").get(activeCheck);
router.route("/post").post(upload.single("media"), createPost);
router.route("/posts").get(allPosts);
router.route("/delete_post").delete(deletePost);
router.route("/comment").post(commentPost);
router.route("/get_comments").post(get_comments_by_post);
router.route("/delete_comment").delete(deleteComment);
router.route("/increment_post_likes").post(increaseLikes);

export default router;
