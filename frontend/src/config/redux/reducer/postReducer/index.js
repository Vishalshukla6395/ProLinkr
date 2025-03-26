import { createSlice } from "@reduxjs/toolkit";
import {
  allPosts,
  getAllComments,
  incrementPostLikes,
} from "../../action/postAction";

const initialState = {
  posts: [],
  isError: false,
  isLoading: false,
  loggedIn: false,
  message: "",
  comments: [],
  postId: "",
  postFetched: false,
  likePending: {},
};

const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    reset: () => initialState,
    resetPostId: (state) => {
      state.postId = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(allPosts.pending, (state) => {
        state.isLoading = true;
        state.message = "Fetching all the posts...";
      })
      .addCase(allPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.postFetched = true;
        state.posts = action.payload.posts.reverse();
      })
      .addCase(allPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getAllComments.fulfilled, (state, action) => {
        state.postId = action.payload.post_id;
        state.comments = action.payload.comments;
      })
      .addCase(incrementPostLikes.pending, (state, action) => {
        const postId = action.meta.arg.post_id;
        state.likePending[postId] = true;
      })
      .addCase(incrementPostLikes.fulfilled, (state, action) => {
        const { post_id, likes, likedBy } = action.payload;
        state.likePending[post_id] = false;
        state.posts = state.posts.map((post) =>
          post._id === post_id ? { ...post, likes, likedBy } : post
        );
      })
      .addCase(incrementPostLikes.rejected, (state, action) => {
        const postId = action.meta.arg.post_id;
        state.likePending[postId] = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, resetPostId } = postSlice.actions;
export default postSlice.reducer;
