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
import auth from "../middleware/auth.js";

//Creating the router object
const router = express.Router();

router.post("/", auth, createPost); //-> Creating a post

router.get("/newest", getNewestPosts); //-> Get the newest posts

router.get("/popular", getPopularPosts); //-> Get the most popular posts

router.get("/:id", getPost); //-> Get a post

router.get("/:userId/posts", getUserPosts); //-> Get all posts of a user

router.put("/:id", auth, updatePost); //-> Update a post

router.delete("/:id/:userId", auth, deletePost); //-> Delete a post

router.put("/:id/like", auth, likePost); //-> Like/Unlike a post

router.put("/:id/comment", auth, commentPost); //-> Comment on a post

router.put("/:id/save", auth, savePost); //-> Save/Unsave a post

router.put("/:id/unsave", auth, unsavePost); //-> Save/Unsave a post

router.get("/:id/savedPosts", getSavedPosts); //-> Get all the saved posts of a user

router.get("/:id/followingPosts", getFollowingPosts); //-> Get feed posts from followings

//Exporting the router object
export default router;
