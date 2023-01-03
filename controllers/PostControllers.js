//! This file contains all the controllers for the post actions routes
//? All routes begin with '/post'

import postModel from "../models/postModel.js";
import userModel from "../models/userModel.js";
import mongoose from "mongoose";

//! Creating a new post
export const createPost = async (req, res) => {
	const postDetails = req.body;

	// create a new post using the model
	const newPost = new postModel(postDetails);

	try {
		// save the post
		await newPost.save();
		// return the newly created post
		res.status(200).json(newPost);
	} catch (error) {
		res.status(500).json(error);
	}
};

//! Update a post
export const updatePost = async (req, res) => {
	const targetPostId = req.params.id;
	const { userId } = req.body;

	try {
		// get the previous version of the post
		const prevPost = await postModel.findById(targetPostId);

		// check if the post belongs to the current user
		if (prevPost.userId.toString() === userId) {
			// update the post
			await prevPost.updateOne({ $set: req.body });
			res.status(200).json("Post Updated successfully!");
		} else {
			res
				.status(403)
				.json("Action forbidden! You can only update your own post!");
		}
	} catch (error) {
		res.status(500).json(error.message);
	}
};

//! Delete post
export const deletePost = async (req, res) => {
	const targetPostId = req.params.id;
	const currentUserId = req.params.userId;

	// We are taking both the arguments from the params since a http delete request does not allow a request to have a body.

	try {
		const post = await postModel.findById(targetPostId);

		// check if the post belongs to the current user
		if (post.userId.toString() === currentUserId) {
			// delete the post
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
};

//! Like/Unlike a Post
export const likePost = async (req, res) => {
	const targetPostId = req.params.id;

	const { userId: currentUserId } = req.body;

	try {
		// get the post
		const post = await postModel.findById(targetPostId);

		// check if the likes array contains the user's id
		if (!post.likes.includes(currentUserId)) {
			// user has not liked the post previously, so this request is for liking. Push the user's id into the likes array of the post
			await post.updateOne({ $push: { likes: currentUserId } });
			res.status(200).json("Post liked successfully!");
		} else {
			// user has already liked the post previously so this request is for unliking. Pull the user's id from the likes array of the post
			await post.updateOne({ $pull: { likes: currentUserId } });
			res.status(200).json("Post unliked successfully!");
		}
	} catch (error) {
		res.status(500).json(error);
	}
};

//! Comment on a post
export const commentPost = async (req, res) => {
	const targetPostId = req.params.id;

	try {
		// get the post
		const targetPost = await postModel.findById(targetPostId);

		// create a new comment object
		const newComment = {
			user: req.body.currentUserId,
			text: req.body.text,
		};

		// update the post and push the new comment into the comments array
		await targetPost.updateOne({ $push: { comments: newComment } });
		res.status(200).json("Commented Successfully!");
	} catch (error) {
		res.status(500).json(error);
	}
};

//! Save a post
export const savePost = async (req, res) => {
	const targetPostId = req.params.id;

	const { userId: currentUserId } = req.body;

	try {
		// get the current user
		const currentUser = await userModel.findById(currentUserId);

		// if the savedPosts array of the user does not contain the post id, push the post id
		if (!currentUser.savedPosts.includes(targetPostId)) {
			await currentUser.updateOne({ $push: { savedPosts: targetPostId } });
			res.status(200).json("Post Saved!");
		} else {
			res.status(403).json("Post already saved by user!");
		}
	} catch (error) {
		res.status(500).json(error);
	}
};

//! Unsave a post
export const unsavePost = async (req, res) => {
	const targetPostId = req.params.id;

	const { userId: currentUserId } = req.body;

	try {
		// get the post
		const currentUser = await userModel.findById(currentUserId);

		// if the savedPosts array of the user contains the postid, pull the post id
		if (currentUser.savedPosts.includes(targetPostId)) {
			await currentUser.updateOne({ $pull: { savedPosts: targetPostId } });
			res.status(200).json("Post Unsaved!");
		} else {
			res.status(403).json("Post is not saved by user");
		}
	} catch (error) {
		res.status(500).json(error);
	}
};

//! Get a post
export const getPost = async (req, res) => {
	const targetPostId = req.params.id;

	try {
		// get the post and populate the userId with the post user data
		const targetPost = await postModel
			.findById(targetPostId)
			.populate("userId");
		res.status(200).json(targetPost);
	} catch (error) {
		res.status(500).json(error);
	}
};

//! Get all posts of a user
export const getUserPosts = async (req, res) => {
	const targetUserId = req.params.userId;

	try {
		// get all posts which have the current user's id and populate the userId with the post user data
		const targetUserPosts = await postModel
			.find({ userId: targetUserId })
			.populate({
				path: "userId",
				select: "_id username profilePhoto",
			});

		// sort the posts in descending order of creation
		res.status(200).json(
			targetUserPosts.sort((a, b) => {
				return b.createdAt - a.createdAt;
			})
		);
	} catch (error) {
		res.status(500).json(error);
	}
};

//! Get the saved Posts of a user
export const getSavedPosts = async (req, res) => {
	const currentUserId = req.params.id;

	try {
		// get the user
		const currentUser = await userModel.findById(currentUserId);

		// get the savedPosts array of the current user
		const savedPosts = currentUser.savedPosts;

		// get all posts that have ids in the savedPosts array and populate their userId field with the users' info
		const results = await postModel
			.find({ _id: { $in: savedPosts } })
			.populate({
				path: "userId",
				select: "_id username profilePhoto",
			});

		res.status(200).json(results);
	} catch (error) {
		res.status(500).json(error.message);
	}
};

//! Get the comments of a post
export const getPostComments = async (req, res) => {
	const targetPostId = req.params.id;

	try {
		// get the post and populate the userId field of its comments array with the users' data
		const targetPost = await postModel.findById(targetPostId).populate({
			path: "comments.user",
			select: "_id username profilePhoto",
		});

		// get the populated comments array
		const postComments = targetPost.comments;

		res.status(200).json(postComments);
	} catch (error) {
		res.status(500).json(error.message);
	}
};

//! Get Following Posts
export const getFollowingPosts = async (req, res) => {
	const currentUserId = req.params.id;

	try {
		// get all the posts of the current user
		const currentUserPosts = await postModel
			.find({ userId: currentUserId })
			.populate("userId");

		const currentUser = await userModel.findById(currentUserId);

		const followingUsers = currentUser.following;

		// get all the post which belong to users in the followings array of the current user and populate the userId field
		const followingUsersPosts = await postModel
			.find({ userId: { $in: followingUsers } })
			.populate("userId");

		// merge the two post arrays and sort in descending of creation
		res.status(200).json(
			currentUserPosts.concat(...followingUsersPosts).sort((a, b) => {
				return b.createdAt - a.createdAt;
			})
		);
	} catch (error) {
		res.status(500).json(error.message);
	}
};

//! Get Newest Posts
export const getNewestPosts = async (req, res) => {
	try {
		// get all the posts and populate the userId field
		const newestPosts = await postModel
			.find()
			.populate({ path: "userId", select: "_id username profilePhoto" });

		// sort the posts in descending order of creation
		res.status(200).json(
			newestPosts.sort((a, b) => {
				return b.createdAt - a.createdAt;
			})
		);
	} catch (error) {
		res.status(500).json(error);
	}
};

//! Get most Popular Posts
export const getPopularPosts = async (req, res) => {
	try {
		// get all the posts, sort the posts in descending order of likes count and populate the userId field
		const popularPosts = await postModel
			.find({})
			.sort({ likes: -1 })
			.populate({ path: "userId", select: "_id username profilePhoto" });

		res.status(200).json(popularPosts);
	} catch (error) {
		res.status(500).json(error.message);
	}
};
