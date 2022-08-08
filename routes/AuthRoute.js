//! This file contains all the routes related to Authentication
// All routes start with /auth

import express from "express";
import { loginUser, registerUser } from "../controllers/AuthControllers.js";

const router = express.Router(); //create a router object

router.post("/register", registerUser); //Route for registering a user

router.post("/login", loginUser); //Route for logining in a user

export default router;
