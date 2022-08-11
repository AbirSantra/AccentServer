//! This file contains all the routes related to a user
// All routes start with /user

import express from "express";
import {
  deleteUser,
  followUser,
  getUser,
  unfollowUser,
  updateUser,
} from "../controllers/UserControllers.js";

const router = express.Router();

router.get("/:id", getUser); // getting user's details

router.put("/:id", updateUser); // updating a user's details

router.delete("/:id", deleteUser); // deleting a user's details

router.put("/:id/follow", followUser); // following a user

router.put("/:id/unfollow", unfollowUser); // unfollow a user

export default router;
