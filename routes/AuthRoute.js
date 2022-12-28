//! This file contains all the routes related to Authentication
// All routes start with /auth

import express from "express";
import {
	loginUser,
	registerUser,
	logout,
	refresh,
} from "../controllers/AuthControllers.js";

const router = express.Router(); //create a router object

router.post("/register", registerUser); //Route for registering a user

router.post("/login", loginUser); //Route for logining in a user

router.get("/refresh", refresh); // Route for refreshing the access token

router.get("/logout", logout); // Route for logging out user

export default router;
