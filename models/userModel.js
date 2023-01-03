// ! This file contains the user schema and model and exports it.

import mongoose from "mongoose";

// User Schema Definition
const UserSchema = mongoose.Schema(
	{
		username: {
			type: String,
			required: true,
			unique: true,
		},
		email: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: true,
		},
		firstname: {
			type: String,
			required: true,
		},
		lastname: {
			type: String,
			required: true,
		},
		isAdmin: {
			type: Boolean,
			default: false,
		},
		profilePhoto: String,
		coverPhoto: String,
		bio: String,
		livesIn: String,
		worksAt: String,
		skills: String,
		followers: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Users",
			},
		],
		following: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Users",
			},
		],
		savedPosts: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Posts",
			},
		],
		donationLink: String,
	},
	{ timestamps: true }
);

// User Model Definition
const userModel = mongoose.model("Users", UserSchema);

// Export Model
export default userModel;
