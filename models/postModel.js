//! This file contains the schema definition and models related to posts

import mongoose from "mongoose";

// Post schema definition
const postSchema = mongoose.Schema(
  {
    userId: { type: String, required: true },
    desc: String,
    likes: [],
    image: String,
  },
  {
    timestamps: true,
  }
);

// Post model deifinition
const postModel = mongoose.model("Posts", postSchema);

export default postModel;
