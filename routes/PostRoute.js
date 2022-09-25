//! This file contains all the routes related to Posts
//? All routes start with /post

import express from "express";
import {
  commentPost,
  createPost,
  deletePost,
  getFollowingPosts,
  getNewestPosts,
  getPopularPosts,
  getPost,
  getSavedPosts,
  getUserPosts,
  likePost,
  savePost,
  unsavePost,
  updatePost,
} from "../controllers/PostControllers.js";

//Creating the router object
const router = express.Router();

router.post("/", createPost); //-> Creating a post

router.get("/newest", getNewestPosts); //-> Get the newest posts

router.get("/popular", getPopularPosts); //-> Get the most popular posts

router.get("/:id", getPost); //-> Get a post

router.get("/:userId/posts", getUserPosts); //-> Get all posts of a user

router.put("/:id", updatePost); //-> Update a post

router.delete("/:id/:userId", deletePost); //-> Delete a post

router.put("/:id/like", likePost); //-> Like/Unlike a post

router.put("/:id/comment", commentPost); //-> Comment on a post

router.put("/:id/save", savePost); //-> Save/Unsave a post

router.put("/:id/unsave", unsavePost); //-> Save/Unsave a post

router.get("/:id/savedPosts", getSavedPosts); //-> Get all the saved posts of a user

router.get("/:id/followingPosts", getFollowingPosts); //-> Get feed posts from followings

//Exporting the router object
export default router;
