//! This file contains the schema definition and models related to posts

import mongoose from "mongoose";

/*
Requirements of a Post
1.  User Img and Username
2.  Post Image
3.  Like and comments count
4.  Post Description
5.  Timestamp
*/

// Post schema definition
const postSchema = mongoose.Schema(
  {
    userId: { type: String, required: true },
    desc: String,
    likes: [],
    comments: [],
    image: String,
  },
  {
    timestamps: true,
  }
);

// Post model deifinition
const postModel = mongoose.model("Posts", postSchema);

export default postModel;
