//! This file contains all the routes related to Posts

import express from "express";
import { createPost, updatePost } from "../controllers/PostControllers.js";

//Creating the router object
const router = express.Router();

router.post("/", createPost); //-> Creating a post

router.put("/:id", updatePost); //-> Update a post

//Exporting the router object
export default router;
