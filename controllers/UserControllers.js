//! This file contains all the controllers for all the routes related to users

import userModel from "../models/userModel.js";
import bycrpt from "bcrypt";
import mongoose from "mongoose";

//! Getting user details
/**
 * @api {get} /user/:id Get User Details
 * @apiName Get User
 * @apiGroup User
 * @apiDescription This endpoint can be used to get the details of a user. This requires the target user's ID to be passed in the params. Returns an object containing the user details.
 *
 *
 * @apiParam {Number} id User's unique ID.
 *
 * @apiSuccessExample {json} Success-Response:
 * 200 OK
 * {
 * 	<User Details>
 * }
 *
 * @apiError 404 User not found
 * @apiError (500) 500 Internal Server Error
 */
export const getUser = async (req, res) => {
	const userId = req.params.id;

	try {
		const user = await userModel.findById(userId);
		// all the details are returned under user._doc by mongoDB

		if (user) {
			const { password, ...userDetails } = user._doc;

			res.status(200).json(userDetails);
		} else {
			res.status(404).json("User not found!");
		}
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

//! Getting User through search
/**
 * @api {get} /user/search/:query Get User through Search
 * @apiName Get User Search
 * @apiGroup User
 * @apiDescription This endpoint can be used to search for users. This requires the target user's firstname, lastname or username to be passed in the params. Returns an array of all users matching the search query.
 *
 *
 * @apiParam {String} query Search query (username, firstname or lastname)
 *
 * @apiSuccessExample {json} Success-Response:
 * 200 OK
 * [{<User 1 details>},{<User 2 details>},...]
 *
 * @apiError (500) 500 Internal Server Error
 */
export const getUserSearch = async (req, res) => {
	const query = req.params.query;

	try {
		const searchQuery = new RegExp(query, "i");

		const searchResults = await userModel.find({
			$or: [
				{ username: searchQuery },
				{ firstname: searchQuery },
				{ lastname: searchQuery },
			],
		});

		res.status(200).json(searchResults);
	} catch (error) {
		res.status(500).json(error);
	}
};

//! Updating User details
/**
 * @api {put} /user/:id Update User's Details
 * @apiName Update User
 * @apiGroup User
 * @apiDescription This endpoint can be used to update the details of a user. This requires the target user's ID to be passed in the params and the details to be updated in the request body. Returns an object containing the updated user details.
 *
 *
 * @apiParam {String} id User's unique id
 *
 * @apiSuccessExample {json} Success-Response:
 * 200 OK
 * {
 * 	<Updated User's details>
 * }
 *
 * @apiError 400 Username is already taken
 * @apiError 403 Access denied
 * @apiError (500) 500 Internal Server Error
 */
export const updateUser = async (req, res) => {
	const userId = req.params.id;

	const { currentUserId, isAdmin, password, ...userDetails } = req.body;

	// try to find a user with the same username
	const existingUser = await userModel.findOne({ username: req.body.username });

	if (existingUser) {
		// if the existing user is not the current user
		if (existingUser?._id?.toString() !== currentUserId) {
			return res.status(400).json({ message: "Username is already taken!" });
		}
	}

	if (userId === currentUserId || isAdmin) {
		try {
			if (password) {
				const salt = await bycrpt.genSalt(10);
				req.body.password = await bycrpt.hash(password, salt);
			}

			const updatedUser = await userModel.findByIdAndUpdate(
				userId,
				userDetails,
				{
					new: true,
				}
			);
			res.status(200).json(updatedUser);
		} catch (error) {
			res.status(500).json(error.message);
		}
	} else {
		res
			.status(403)
			.json("Access Denied! You can only update your own profile.");
	}
};

//! Deleting a user
/**
 * @api {delete} /user/:id Delete a User
 * @apiName Delete User
 * @apiGroup User
 * @apiDescription This endpoint can be used to delete a user. This requires the target user's ID to be passed in the params. Returns a success message on deletion.
 *
 *
 * @apiParam {String} id User's unique id
 *
 * @apiSuccessExample {json} Success-Response:
 * 200 OK
 * {
 * 	"message": "User successfully deleted!"
 * }
 *
 * @apiError 403 Access denied
 * @apiError (500) 500 Internal Server Error
 */
export const deleteUser = async (req, res) => {
	const targetUserId = req.params.id;

	const { currentUserId, isAdmin } = req.body;

	if (currentUserId === targetUserId || isAdmin) {
		try {
			await userModel.findByIdAndDelete(targetUserId);
			res.status(200).json("User successfully deleted!");
		} catch (error) {
			res.status(500).json(error);
		}
	} else {
		res
			.status(403)
			.json("Access denied! You can only delete your own profile.");
	}
};

//! Following a User
/**
 * @api {put} /user/:id/follow Follow a user
 * @apiName Follow User
 * @apiGroup User
 * @apiDescription This endpoint can be used to follow a user. This requires the target user's ID to be passed in the params and the current user's id in the request body. Returns a success message
 *
 *
 * @apiParam {String} id User's ID to follow
 *
 * @apiSuccessExample {json} Success-Response:
 * 200 OK
 * {
 * 	"message": "User followed!"
 * }
 *
 * @apiError 403 User tried to follow his own account or User was already following the target user
 * @apiError (500) 500 Internal Server Error
 */
export const followUser = async (req, res) => {
	const targetUserId = req.params.id;

	const { currentUserId } = req.body;

	// check if user is trying following himself
	if (targetUserId === currentUserId) {
		res
			.status(403)
			.json("Action forbidden! You cannot follow your own account.");
	} else {
		try {
			const targetUser = await userModel.findById(targetUserId);
			const currentUser = await userModel.findById(currentUserId);

			if (!targetUser.followers.includes(currentUserId)) {
				await targetUser.updateOne({ $push: { followers: currentUserId } });
				await currentUser.updateOne({ $push: { following: targetUserId } });
				res.status(200).json("User followed!");
			} else {
				res.status(403).json("User is already followed by you!");
			}
		} catch (error) {
			res.status(500).json(error.message);
		}
	}
};

//! Unfollow User
/**
 * @api {put} /user/:id/unfollow UnFollow a user
 * @apiName UnFollow User
 * @apiGroup User
 * @apiDescription This endpoint can be used to unfollow a user. This requires the target user's ID to be passed in the params and the current user's id in the request body. Returns a success message
 *
 *
 * @apiParam {String} id User's ID to unfollow
 *
 * @apiSuccessExample {json} Success-Response:
 * 200 OK
 * {
 * 	"message": "User unfollowed!"
 * }
 *
 * @apiError 403 User tried to unfollow his own account or User was not already following the target user
 * @apiError (500) 500 Internal Server Error
 */
export const unfollowUser = async (req, res) => {
	const targetUserId = req.params.id;

	const { currentUserId } = req.body;

	// check if user if trying to unfollow himself
	if (targetUserId === currentUserId) {
		res.status(403).json("Action Forbidden! You cannot unfollow yourself");
	} else {
		try {
			const targetUser = await userModel.findById(targetUserId);

			const currentUser = await userModel.findById(currentUserId);

			if (targetUser.followers.includes(currentUserId)) {
				await targetUser.updateOne({ $pull: { followers: currentUserId } });
				await currentUser.updateOne({ $pull: { following: targetUserId } });
				res.status(200).json("User Unfollowed!");
			} else {
				res.status(403).json("User is not followed by you!");
			}
		} catch (error) {
			res.status(500).json(error);
		}
	}
};

//! Get the followers of an user
/**
 * @api {get} /user/:id/followers Get Followers of a User
 * @apiName Get User Followers
 * @apiGroup User
 * @apiDescription This endpoint can be used to get all the followers of a user. This requires the target user's ID to be passed in the params. Returns an array of user-details objects.
 *
 *
 * @apiParam {String} id User's ID
 *
 * @apiSuccessExample {json} Success-Response:
 * 200 OK
 * [
 * {<User 1 details>},
 * {<User 2 details>},
 * ...
 * ]
 *
 * @apiError (500) 500 Internal Server Error
 */
export const getUserFollowers = async (req, res) => {
	const currentUserId = req.params.id;

	try {
		// get the current user
		const currentUser = await userModel.findById(currentUserId);

		// get all the users that are present in the current users followers array
		const followers = await userModel.find({
			_id: { $in: currentUser.followers },
		});

		res.status(200).json(followers);
	} catch (error) {
		res.status(500).json(error);
	}
};

//! Get the followings of a user
/**
 * @api {get} /user/:id/following Get Followings of User
 * @apiName Get User Followings
 * @apiGroup User
 * @apiDescription This endpoint can be used to get all the users that the current user is following. This requires the target user's ID to be passed in the params. Returns an array of user-details objects.
 *
 *
 * @apiParam {String} id User's ID
 *
 * @apiSuccessExample {json} Success-Response:
 * 200 OK
 * [
 * {<User 1 details>},
 * {<User 2 details>},
 * ...
 * ]
 *
 * @apiError (500) 500 Internal Server Error
 */
export const getUserFollowings = async (req, res) => {
	const currentUserId = req.params.id;

	try {
		// get the current user
		const currentUser = await userModel.findById(currentUserId);

		// get all the users that are present in the followers array of the user
		const followings = await userModel.find({
			_id: { $in: currentUser.following },
		});

		res.status(200).json(followings);
	} catch (error) {
		res.status(500).json(error);
	}
};
