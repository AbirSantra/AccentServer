//! This file contains all the routes related to Posts

import express from "express";
import {
  createPost,
  deletePost,
  getFollowingPosts,
  getNewestPosts,
  getPopularPosts,
  getPost,
  likePost,
  savePost,
  updatePost,
} from "../controllers/PostControllers.js";

//Creating the router object
const router = express.Router();

router.post("/", createPost); //-> Creating a post

router.get("/newest", getNewestPosts); //-> Get the newest posts

router.get("/popular", getPopularPosts); //-> Get the most popular posts

router.get("/:id", getPost); //-> Get a post

router.put("/:id", updatePost); //-> Update a post

router.delete("/:id", deletePost); //-> Delete a post

router.put("/:id/like", likePost); //-> Like/Unlike a post

router.put("/:id/save", savePost); //-> Save/Unsave a post

router.get("/:id/followingPosts", getFollowingPosts); //-> Get feed posts from followings

//Exporting the router object
export default router;
