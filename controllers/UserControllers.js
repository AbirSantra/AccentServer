//! This file contains all the controllers for all the routes related to users
// These are basically the functions that are carried out when the specific route is called

import userModel from "../models/userModel.js";
import bycrpt from "bcrypt";

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

//! Updating User details
export const updateUser = async (req, res) => {
  const userId = req.params.id;

  const { currentUserId, isAdmin, password } = req.body;

  if (userId === currentUserId || isAdmin) {
    try {
      if (password) {
        const salt = await bycrpt.genSalt(10);
        req.body.password = await bycrpt.hash(password, salt);
      }

      const updatedUser = await userModel.findByIdAndUpdate(userId, req.body, {
        new: true,
      });
      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res
      .status(403)
      .json("Access Denied! You can only update your own profile.");
  }

  // Get the userId of the account we want to update from params
  // Get the current user's id, admin status, and updated password from the req.body
  // A user can only update an account if (1) it is his own account, that is, the target user id and current user id are the same or (2) if the current user is an admin
  // Check if the request contains a password field
  // If true, then that means that the user has requested a password changed. So we change the password field in the req.body to a hashed password
  // Then, update the user details using findByIdAndUpdate() passing the target id, req.body(details to be updated) and set new:true
  // If any error occurs, return the error message.
  // Incase, the current user id does not match the target id or the current user is not admin, return message "Access denied"
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

  // Get the target user id to be deleted from the params
  // Get the current user id, admin status from the req.body
  // A user can delete an account only if (1) the user is trying to delete his own account, that is, the current user id is the same as the target user id or (2) the current user is an admin
  // Delete the user account using findByIdAndDelete() and send successful completion message
  // If any error, send the error message
  // In case, the current user id does not match the target user id or the current user is not an admin, return message "Access Denied"
};
