//! This file contains all the controllers for the post actions routes
//? All routes begin with '/post'

import postModel from "../models/postModel.js";
import userModel from "../models/userModel.js";
import mongoose from "mongoose";

//! Creating a new post
export const createPost = async (req, res) => {
  const postDetails = req.body;

  const newPost = new postModel(postDetails);

  try {
    await newPost.save();
    res.status(200).json("Successfully posted!");
  } catch (error) {
    res.status(500).json(error);
  }

  /*
  1. Get the post details from req.body
  2. Create a new post using the post model putting the post details
  3. Try to save it to the database.
  4. If successful, then send success message
  5. Else, send error message
  */
};

//! Update a post
export const updatePost = async (req, res) => {
  const targetPostId = req.params.id;

  const { userId } = req.body;

  try {
    const prevPost = await postModel.findById(targetPostId);
    if (prevPost.userId === userId) {
      await prevPost.updateOne({ $set: req.body });
      res.status(200).json("Post Updated successfully!");
    } else {
      res
        .status(403)
        .json("Action forbidden! You can only update your own post!");
    }
  } catch (error) {
    res.status(500).json(error);
  }

  /*
  1. Get the target post id from the params
  2. Get the userId from the body
  3. Find the target post from the database using the target post id
  4. Check if the targetPost's userId field matches with the userId provided in the body
  5. If true, then that means the user is trying to update his own post which is acceptable
  6. Update the targetPost using updateOne() and $set the post to be req.body
  7. Send the success messsage.
  8. Else, it means the user is trying to update someone else's post which is not acceptable. So send error message.
  9. If any error, send error message.
  */
};

//! Delete post
export const deletePost = async (req, res) => {
  const targetPostId = req.params.id;

  const { userId } = req.body;

  try {
    const post = await postModel.findById(targetPostId);

    if (post.userId === userId) {
      await post.deleteOne();
      res.status(200).json("Post successfully deleted!");
    } else {
      res
        .status(403)
        .json("Action forbidden! You can only delete your own post.");
    }
  } catch (error) {
    res.status(500).json(error);
  }

  /* 
  1. Get the target post id from the params
  2. Get the current user id from the body
  3. Find the post in the database using the target post id
  4. If the post.userId matches the current user id, then it means the user is trying to delete their own post which is acceptable
  5. Delete the post using deleteOne() and return success message
  6. Else the user is trying to delete someone else's post which is not acceptable. So send error message
  7. If any other error, send the error message
  */
};

//! Like/Unlike a Post
export const likePost = async (req, res) => {
  const targetPostId = req.params.id;

  const { userId: currentUserId } = req.body;

  try {
    const post = await postModel.findById(targetPostId);

    if (!post.likes.includes(currentUserId)) {
      await post.updateOne({ $push: { likes: currentUserId } });
      res.status(200).json("Post liked successfully!");
    } else {
      await post.updateOne({ $pull: { likes: currentUserId } });
      res.status(200).json("Post unliked successfully!");
    }
  } catch (error) {
    res.status(500).json(error);
  }

  /*
  1. Get the target post id from the params
  2. Get the current user id from the body
  3. Find the target post in the database using the target post id
  4. If the likes array of the post does not contain the current user id, then it means that the user wants to like the post.
  5. Push the current user id into the likes array of the target post using updateOne() and send success message
  6. Else if the likes array already contains the current user id, then it means that the user wants to dislike the post
  7. Pull the current user id from the likes array of the target post using updateOne() and send success message
  8. If any error, then return the error message
  */
};

//! Save/Unsave a post
export const savePost = async (req, res) => {
  const targetPostId = req.params.id;

  const { userId: currentUserId } = req.body;

  try {
    const currentUser = await userModel.findById(currentUserId);

    if (!currentUser.savedPosts.includes(targetPostId)) {
      await currentUser.updateOne({ $push: { savedPosts: targetPostId } });
      res.status(200).json("Post successfully saved!");
    } else {
      await currentUser.updateOne({ $pull: { savedPosts: targetPostId } });
      res.status(200).json("Post successfully unsaved!");
    }
  } catch (error) {
    res.status(500).json(error);
  }

  /*
  1. Get the target post id from the params
  2. Get the current user id from the body
  3. Find the current user in the database using the current user id
  4. If the savedPosts array of the user does not contain the target post id, then it means that the user wants to save the post.
  5. Push the target post id into the savedPosts array of the current user using updateOne() and send success message
  6. Else if the savedPosts array already contains the target post id, then it means that the user wants to unsave the post
  7. Pull the target post id from the savedPosts array of the current user using updateOne() and send success message
  8. If any error, then return the error message
  */
};

//! Get a post
export const getPost = async (req, res) => {
  const targetPostId = req.params.id;

  try {
    const targetPost = await postModel.findById(targetPostId);
    res.status(200).json(targetPost);
  } catch (error) {
    res.status(500).json(error);
  }

  /*
  1. Get the target post id from the params
  2. Find the post in the database using the target post id
  3. Return the post
  4. If any error, send error message
  */
};
