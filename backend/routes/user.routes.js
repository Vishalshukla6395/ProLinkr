import { Router } from "express";
import {
  acceptConnectionRequest,
  downloadProfile,
  getAllUserProfile,
  getProfileByUsername,
  getUserAndProfile,
  myConnectionRequests,
  myConnections,
  register,
  sendConnectionRequest,
  updateProfileData,
  updateUserProfile,
  login,
  uploadProfilePicture,
  commentPost,
  get_comments_by_post,
  deleteComment,
} from "../controllers/user.controller.js";
import multer from "multer";
const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

router
  .route("/update_profile_picture")
  .post(upload.single("profile_picture"), uploadProfilePicture);

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/user_update").post(updateUserProfile);
router.route("/get_user_and_profile").get(getUserAndProfile);
router.route("/update_profile_data").post(updateProfileData);
router.route("/user/get_all_users").get(getAllUserProfile);
router.route("/user/download_resume").get(downloadProfile);
router.route("/user/send_connection_request").post(sendConnectionRequest);
router.route("/user/getConnectionRequests").get(myConnectionRequests);
router.route("/user/user_connection_request").get(myConnections);
router.route("/user/accept_connection_request").post(acceptConnectionRequest);
router.route("/user/get_profile_by_username").get(getProfileByUsername);

router.route("/post/comment").post(commentPost);
router.route("/post/get_comments").post(get_comments_by_post);
router.route("/post/delete_comment").post(deleteComment);

export default router;
