import clientServer from "@/config/index";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const allPosts = createAsyncThunk(
  "post/allPosts",
  async (_, thunkAPI) => {
    try {
      const response = await clientServer.get("/posts");
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Something went wrong"
      );
    }
  }
);

export const createPost = createAsyncThunk(
  "post/createPost",
  async (userData, thunkAPI) => {
    const { file, body } = userData;
    try {
      const formData = new FormData();
      formData.append("token", localStorage.getItem("token"));
      formData.append("body", body);
      formData.append("media", file);

      const response = await clientServer.post("/post", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return response.status === 200
        ? thunkAPI.fulfillWithValue("Post uploaded")
        : thunkAPI.rejectWithValue("Post not uploaded");
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Something went wrong"
      );
    }
  }
);

export const deletePost = createAsyncThunk(
  "post/deletePost",
  async (post_id, thunkAPI) => {
    try {
      const response = await clientServer.delete("/delete_post", {
        data: {
          token: localStorage.getItem("token"),
          post_id: post_id?.post_id,
        },
      });

      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Something went wrong"
      );
    }
  }
);

export const incrementPostLikes = createAsyncThunk(
  "post/incrementLike",
  async (post, thunkAPI) => {
    const { getState } = thunkAPI;
    const { auth } = getState();
    const userId = auth.user?._id;

    if (!userId) return thunkAPI.rejectWithValue("User not authenticated");

    try {
      const response = await clientServer.post("/increment_post_likes", {
        user_id: userId,
        post_id: post?.post_id,
      });
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Something went wrong"
      );
    }
  },
  {
    condition: (post, { getState }) => {
      const { likePending } = getState().post;
      return !(likePending && likePending[post?.post_id]);
    },
  }
);

export const getAllComments = createAsyncThunk(
  "post/getAllComments",
  async (postData, thunkAPI) => {
    try {
      const response = await clientServer.post("/get_comments", {
        post_id: postData?.post_id,
      });
      return thunkAPI.fulfillWithValue({
        comments: response.data,
        post_id: postData?.post_id,
      });
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Something went wrong"
      );
    }
  }
);

export const postComment = createAsyncThunk(
  "post/postComment",
  async (commentData, thunkAPI) => {
    try {
      const response = await clientServer.post("/comment", {
        token: localStorage.getItem("token"),
        post_id: commentData?.post_id,
        commentBody: commentData?.body,
      });
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Something went wrong"
      );
    }
  }
);
