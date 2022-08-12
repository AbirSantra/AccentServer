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
