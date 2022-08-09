//! This file contains all the controllers for all the routes related to users
// These are basically the functions that are carried out when the specific route is called

import userModel from "../models/userModel.js";

//! Getting a user from the database
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