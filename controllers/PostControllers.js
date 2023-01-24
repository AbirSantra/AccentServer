//! This file contains all the controllers for the post actions routes
//? All routes begin with '/post'

import postModel from "../models/postModel.js";
import userModel from "../models/userModel.js";
import mongoose from "mongoose";

//! Creating a new post
/**
 * @api {post} /post/ Create New Post
 * @apiName Create Post
 * @apiGroup Post
 * @apiDescription This endpoint is used for creating a post. It requires the post details as the request body. It returns back the details of the newly created post.
 *
 * @apiBody {String} userId Unique ID of the user
 * @apiBody {String} title Title of the Post
 * @apiBody {String} desc Description of the Post
 * @apiBody {Image} image Image URL of the post image
 *
 *
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 *
 * @apiSuccessExample Success-Response:
 *     200 OK
 *     {
 *       <Post Details>
 *     }
 *
 * @apiError (500) Internal Server Error
 */
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
/**
 * @api {put} /post/:id Update a Post
 * @apiName Update Post
 * @apiGroup Post
 * @apiDescription This endpoint can be used to update a specific post. The target post ID is passed in the params and the current user's ID should be passed in the request body. This returns a success message on successful updation.
 *
 *
 * @apiParam {String} id Post's unique id
 *
 * @apiSuccessExample {json} Success-Response:
 * 200 OK
 * {
 * 	"Post updated successfully!"
 * }
 *
 * @apiError 403 Action forbidden. User tried to delete someone else's post
 * @apiError (500) 500 Internal Server Error
 */
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
/**
 * @api {delete} /post/:id/:userId Delete a Post
 * @apiName Delete Post
 * @apiGroup Post
 * @apiDescription This endpoint can be used to delete a post. This requires the target post's ID to be passed in the params and the current user's ID to be passed in the request body. Returns a success message of deletion.
 *
 *
 * @apiParam {String} id Post's unique id
 * @apiParam {String} userId User's unique id
 *
 * @apiSuccessExample {json} Success-Response:
 * 200 OK
 * {
 * 	"Post successfully deleted!"
 * }
 *
 * @apiError 403 Action Forbidden. User tried to delete someone else's post.
 * @apiError (500) 500 Internal Server Error
 */
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
/**
 * @api {put} /post/:id/like Like/Unlike a Post
 * @apiName Like Post
 * @apiGroup Post
 * @apiDescription This endpoint can be used to like/unlike a post. This requires the taget post's ID to be passed in the params and the current user's ID to be passed in the request body. If the post was not previously liked by the user, then the post is liked. Else, the post is unliked. Returns respective success message.
 *
 *
 * @apiParam {String} id Post's ID to like
 *
 * @apiSuccessExample {json} Success-Liked:
 * 200 OK
 * {
 * 	"Post liked successfully!"
 * }
 * @apiSuccessExample {json} Success-UnLiked:
 * 200 OK
 * {
 * 	"Post unliked successfully!"
 * }
 *
 * @apiError (500) 500 Internal Server Error
 */
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
/**
 * @api {put} /post/:id/comment Comment on a Post
 * @apiName Comment on Post
 * @apiGroup Post
 * @apiDescription This endpoint can be used to comment on a post. It requires the target post's ID to be passed in the params and the comment details to be passed in the request body. Returns a success message.
 *
 *
 * @apiParam {String} id Post's ID to comment
 *
 *
 * @apiBody {String} user Unique ID of the user
 * @apiBody {String} text Text of the comment
 *
 * @apiSuccessExample {json} Success-Response:
 * 200 OK
 * {
 * 	"Commented successfully!"
 * }
 *
 *
 * @apiError (500) 500 Internal Server Error
 */
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
/**
 * @api {put} /post/:id/save Save a post
 * @apiName Save a post
 * @apiGroup Post
 * @apiDescription This endpoint can be used to save a post. This requires the target post's ID to be passed in the params and current user's ID in the request body. Returns a success message on save.
 *
 * @apiParam {String} id ID of the target post
 *
 * @apiBody {String} id ID of the post
 * @apiBody {String} userId ID of the user saving the post
 *
 * @apiSuccessExample {json} Success-Response:
 * 200 OK
 * {
 * 	"Post Saved!"
 * }
 *
 *
 * @apiError 403 Post is already saved by the user
 * @apiError (500) 500 Internal Server Error
 */
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
/**
 * @api {put} /post/:id/unsave Unsave a post
 * @apiName Unsave a post
 * @apiGroup Post
 * @apiDescription This endpoint can be used to unsave a post. This requires the target post's ID to be passed in the params and current user's ID in the request body. Returns a success message on unsave.
 *
 * @apiParam {String} id ID of the target post
 *
 * @apiBody {String} id ID of the post
 * @apiBody {String} userId ID of the user unsaving the post
 *
 * @apiSuccessExample {json} Success-Reponse:
 * 200 OK
 * {
 * 	"Post Unsaved!"
 * }
 *
 *
 * @apiError 403 Post is not saved by the user already.
 * @apiError (500) 500 Internal Server Error
 */
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
/**
 * @api {get} /post/:id Get a Post
 * @apiName Get a Post
 * @apiGroup Post
 * @apiDescription This endpoint can be used to get the details of a post. This requires the target post's ID to be passed in the params. It returns an object containing the details of the post.
 *
 * @apiParam {String} id ID of the post
 *
 *
 * @apiSuccessExample {json} Success-Response:
 * 200 OK
 * {
 * 	<Post Details>
 * }
 *
 *
 * @apiError 403 Post is not saved by the user already.
 * @apiError (500) 500 Internal Server Error
 */
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
/**
 * @api {get} /post/:userId/posts Get all posts of User
 * @apiName Get User Posts
 * @apiGroup Post
 * @apiDescription This endpoint can be used to get the all the posts created by a user. This requires the target users's ID to be passed in the params. It returns an array of post-details objects.
 *
 * @apiParam {String} userId ID of the post
 *
 *
 * @apiSuccessExample {json} Success-response:
 * 200 OK
 * [
 * {<Post 1 details>},
 * {<Post 2 details>},
 * ...
 * ]
 *
 *
 * @apiError (500) 500 Internal Server Error
 */
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
/**
 * @api {get} /post/:id/savedPosts Get saved posts
 * @apiName Get Saved Posts
 * @apiGroup Post
 * @apiDescription This endpoint can be used to get the all the posts saved by a user. This requires the target users's ID to be passed in the params. It returns an array of post-details objects.
 *
 * @apiParam {String} id ID of the user
 *
 *
 * @apiSuccessExample {json} Success-Response:
 * 200 OK
 * [
 * {<Post 1 details>},
 * {<Post 2 details>},
 * ...
 * ]
 *
 *
 * @apiError (500) 500 Internal Server Error
 */
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
/**
 * @api {get} /post/:id/comments Get post comments
 * @apiName Get Post Comments
 * @apiGroup Post
 * @apiDescription This endpoint can be used to get the all the comments of a post. This requires the target post's ID to be passed in the params. It returns an array of comment-details objects.
 *
 * @apiParam {String} id ID of the post
 *
 *
 * @apiSuccessExample {json} Success-Response:
 * 200 OK
 * [
 * {<Comment 1 details>},
 * {<Comment 2 details>},
 * ...
 * ]
 *
 *
 * @apiError (500) 500 Internal Server Error
 */
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
/**
 * @api {get} /post/:id/followingPosts Get following Posts
 * @apiName Get Following Posts
 * @apiGroup Post
 * @apiDescription This endpoint can be used to get all posts created by users whom the current user is following along with their own posts. This requires the target users's ID to be passed in the params. It returns an array of post-details objects.
 *
 * @apiParam {String} id ID of the user
 *
 *
 * @apiSuccessExample {json} Success-Response:
 * 200 OK
 * [
 * {<Post 1 details>},
 * {<Post 2 details>},
 * ...
 * ]
 *
 *
 * @apiError (500) 500 Internal Server Error
 */
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
/**
 * @api {get} /post/newest Get Newest Posts
 * @apiName Get Newest Posts
 * @apiGroup Post
 * @apiDescription This endpoint can be used to get all posts in the order of their creation time. It returns an array of post-details objects.
 *
 *
 *
 * @apiSuccessExample {json} Success-Response:
 * 200 OK
 * [
 * {<Post 1 details>},
 * {<Post 2 details>},
 * ...
 * ]
 *
 *
 * @apiError (500) 500 Internal Server Error
 */
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
/**
 * @api {get} /post/popular Get Popular Posts
 * @apiName Get Popular Posts
 * @apiGroup Post
 * @apiDescription This endpoint can be used to get all posts in the order of their popularity based on their number of likes. It returns an array of post-details objects.
 *
 *
 *
 * @apiSuccessExample {json} Success-Response:
 * 200 OK
 * [
 * {<Post 1 details>},
 * {<Post 2 details>},
 * ...
 * ]
 *
 *
 * @apiError (500) 500 Internal Server Error
 */
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
