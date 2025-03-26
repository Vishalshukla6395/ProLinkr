import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  allPosts,
  createPost,
  deletePost,
  getAllComments,
  incrementPostLikes,
  postComment,
} from "@/config/redux/action/postAction";
import { getAboutUser, getAllUsers } from "@/config/redux/action/authAction";
import UserLayout from "@/layout/userLayout";
import DashboardLayout from "@/layout/dashboardLayout";
import Styles from "./dashboard.module.css";
import { resetPostId } from "@/config/redux/reducer/postReducer";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function Dashboard() {
  const dispatch = useDispatch();
  const router = useRouter();
  const authState = useSelector((state) => state.auth);
  const postState = useSelector((state) => state.post);

  const [postContent, setPostContent] = useState("");
  const [fileContent, setFileContent] = useState(null);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    if (authState.isToken) {
      dispatch(allPosts());
      dispatch(getAboutUser({ token: localStorage.getItem("token") }));
    }
  }, [authState.isToken, dispatch]);

  useEffect(() => {
    if (!authState.all_profiles_fetched) {
      dispatch(getAllUsers());
    }
  }, [authState.all_profiles_fetched, dispatch]);

  const handleLikePost = async (postId) => {
    await dispatch(incrementPostLikes({ post_id: postId }));
    await dispatch(allPosts());
  };

  const handleUpload = async () => {
    await dispatch(createPost({ file: fileContent, body: postContent }));
    setPostContent("");
    setFileContent(null);
    dispatch(allPosts());
  };

  const handleDeletePost = async (postId) => {
    await dispatch(deletePost({ post_id: postId }));
    dispatch(allPosts());
  };

  const handleShowComments = (postId) => {
    dispatch(getAllComments({ post_id: postId }));
  };

  const handleCommentSubmit = async () => {
    await dispatch(
      postComment({
        post_id: postState.postId,
        body: commentText,
      })
    );
    await dispatch(getAllComments({ post_id: postState.postId }));
    setCommentText("");
  };

  if (!authState.user) {
    return (
      <UserLayout>
        <DashboardLayout>
          <h2>Loading...</h2>
        </DashboardLayout>
      </UserLayout>
    );
  }

  const getProfileImage = (profilePicture) =>
    profilePicture && profilePicture.url ? profilePicture.url : "";

  const getPostMedia = (media) => {
    if (!media) return "";
    if (media.url) return media.url;
  };

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={Styles.dashboardWrapper}>
          <div className={Styles.createPostContainer}>
            <div className={Styles.createPostTop}>
              <img
                className={Styles.userProfile}
                src={getProfileImage(authState.user.userId.profilePicture)}
                alt="User avatar"
              />
              <textarea
                onChange={(e) => setPostContent(e.target.value)}
                value={postContent}
                className={Styles.textareaOfContent}
                placeholder="What's on your mind?"
              />
            </div>
            <div className={Styles.createPostBottom}>
              <label htmlFor="fileUpload" className={Styles.addMediaButton}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
              </label>
              <input
                onChange={(e) => setFileContent(e.target.files[0])}
                type="file"
                hidden
                id="fileUpload"
              />
              <button onClick={handleUpload} className={Styles.postButton}>
                Post
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className={Styles.postButtonIcon}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 4.5l16.5 7.5-16.5 7.5v-7.5h10.5"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className={Styles.postContainer}>
            {postState.posts.map((post) => {
              const isLiked =
                post.likedBy &&
                post.likedBy.includes(authState.user.userId._id);

              const mediaUrl = getPostMedia(post.media);

              return (
                <div key={post._id} className={Styles.singleCard}>
                  <div className={Styles.singleCard_profileContainer}>
                    <img
                      src={getProfileImage(post.userId.profilePicture)}
                      alt="User avatar"
                      className={Styles.userProfile}
                    />
                    <div className={Styles.postUserInfo}>
                      <div className={Styles.postUserTop}>
                        <p className={Styles.postUserName}>
                          {post.userId.name}
                        </p>
                        {post.userId._id === authState.user.userId._id && (
                          <div
                            onClick={() => handleDeletePost(post._id)}
                            className={Styles.delButtonContainer}
                          >
                            <svg
                              className={Styles.delButton}
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21
                                   c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673
                                   a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1
                                   -2.244-2.077L4.772 5.79m14.456 0a48.108 48.108
                                   0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022
                                   -.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916
                                   c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0
                                   -3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5
                                   0a48.667 48.667 0 0 0-7.5 0"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      <p className={Styles.postUserHandle}>
                        @{post.userId.username}
                      </p>
                    </div>
                  </div>
                  <div className={Styles.postBody}>
                    <p>{post.body}</p>
                    {mediaUrl && (
                      <div className={Styles.singleCard_image}>
                        <img src={mediaUrl} alt="post media" />
                      </div>
                    )}
                  </div>
                  <div className={Styles.optionsContainer}>
                    <div
                      onClick={() => handleLikePost(post._id)}
                      className={Styles.singleOption_optionsContainer}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill={isLiked ? "#0A66C2" : "none"}
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke={isLiked ? "#0A66C2" : "currentColor"}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6.633 10.25c.806 0 1.533-.446
                          2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384
                          1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322
                          -1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25
                          0 0 1 2.25 2.25c0 1.152-.26 2.243-.723
                          3.218-.266.558.107 1.282.725 1.282h3.126c1.026
                          0 1.945.694 2.054 1.715.045.422.068.85.068
                          1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482
                          -.987.729-1.605.729H13.48c-.483 0-.964-.078
                          -1.423-.23l-3.114-1.04a4.501 4.501 0 0 0
                          -1.423-.23H5.904"
                        />
                      </svg>
                      <p>{post.likes}</p>
                    </div>
                    <div
                      onClick={() => handleShowComments(post._id)}
                      className={Styles.singleOption_optionsContainer}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8.625 12a.375.375
                          0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125
                          0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75
                          0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0
                          .375.375 0 0 1 .75 0Zm0 0h-.375M21
                          12c0 4.556-4.03 8.25-9 8.25a9.764 9.764
                          0 0 1-2.555-.337A5.972 5.972 0 0 1
                          5.41 20.97a5.969 5.969 0 0 1-.474
                          -.065 4.48 4.48 0 0 0 .978-2.025c.09
                          -.457-.133-.901-.467-1.226C3.93 16.178
                          3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9
                          3.694 9 8.25Z"
                        />
                      </svg>
                    </div>
                    <div className={Styles.singleOption_optionsContainer}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M7.217 10.907a2.25
                          2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283
                          1.093s-.103.77-.283 1.093m0-2.186 9.566
                          -5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25
                          0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935
                          -2.186Zm0-12.814a2.25 2.25 0 1 0
                          3.933-2.185 2.25 2.25 0 0 0-3.933
                          2.185Z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {postState.postId && (
          <div
            onClick={() => dispatch(resetPostId())}
            className={Styles.commentsContainer}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className={Styles.allCommentsContainer}
            >
              {postState.comments.length === 0 && <h2>No comments</h2>}
              {postState.comments.length !== 0 && (
                <div>
                  {postState.comments.map((comment) => (
                    <div className={Styles.singleComment} key={comment._id}>
                      <div className={Styles.singleComment_profileContainer}>
                        <img
                          src={getProfileImage(comment.userId.profilePicture)}
                          alt="user"
                        />
                        <div>
                          <p className={Styles.commentUserName}>
                            {comment.userId.name}
                          </p>
                          <p className={Styles.commentUserHandle}>
                            @{comment.userId.username}
                          </p>
                        </div>
                      </div>
                      <p className={Styles.commentBody}>{comment.body}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className={Styles.postCommentContainer}>
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                />
                <button
                  onClick={handleCommentSubmit}
                  className={Styles.commentBtn}
                >
                  Comment
                </button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </UserLayout>
  );
}

export default Dashboard;
