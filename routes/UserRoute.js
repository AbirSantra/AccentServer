//! This file contains all the routes related to a user
// All routes start with /user

import express from "express";
import { getUser, updateUser } from "../controllers/UserControllers.js";

const router = express.Router();

router.get("/:id", getUser); //getting user details

router.put("/:id", updateUser); //updating a user's details

export default router;
