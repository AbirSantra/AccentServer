//! This file contains all the routes related to a user
// All routes start with /user

import express from "express";
import {
	deleteUser,
	followUser,
	getUser,
	getUserFollowers,
	getUserFollowings,
	getUserSearch,
	unfollowUser,
	updateUser,
} from "../controllers/UserControllers.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/:id", getUser); // getting user's details

router.get("/search/:query", getUserSearch); // getting users through search

router.get("/:id/followers", getUserFollowers); // get the followers details

router.get("/:id/following", getUserFollowings); // get the followings details

router.put("/:id", auth, updateUser); // updating a user's details

router.delete("/:id", auth, deleteUser); // deleting a user's details

router.put("/:id/follow", auth, followUser); // following a user

router.put("/:id/unfollow", auth, unfollowUser); // unfollow a user

export default router;
