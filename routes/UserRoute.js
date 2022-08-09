//! This file contains all the routes related to a user
// All routes start with /user

import express from "express";
import { getUser } from "../controllers/UserControllers.js";

const router = express.Router();

router.get("/:id", getUser); //getting user details

export default router;
