//! This file contains all the controllers for the post actions routes
//? All routes begin with '/post'

import postModel from "../models/postModel.js";
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
