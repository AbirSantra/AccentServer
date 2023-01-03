//! This file contains all the controllers for all the routes related to users

import userModel from "../models/userModel.js";
import bycrpt from "bcrypt";
import mongoose from "mongoose";

//! Getting user details
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

	// First, get the user ID from the params (ID is passed as param in the URL not in the body)
	// Try to find the user in the database using the findById() method
	// If the user exists, the details are received under user._doc
	// Destructure the user details to separate the password from the other details
	// Send the other details of the user back to the frontend
	// If the user does not exist, send message "User not found!"
	// If any other error, send the server error message.
};

//! Getting User through search
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
