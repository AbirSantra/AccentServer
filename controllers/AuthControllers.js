// ! This files contains all the controllers related to authentication
// These are basically the logic that is carried out when a specific route is called.

import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";

// Registering a new user
export const registerUser = async (req, res) => {
  const { username, email, password, firstname, lastname } = req.body;

  const salt = await bcrypt.genSalt(10); //generating salt

  const hashedPass = await bcrypt.hash(password, salt); //generating hashed password

  const newUser = new userModel({
    username,
    email,
    password: hashedPass,
    firstname,
    lastname,
  });

  try {
    await newUser.save();
    res.status(200).json(newUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }

  // Here we are receiving the user details from the frontend in req.body. Then we are using bcrypt to generate a salt for the password and then using that salt to generate a hashed password for the user. Then we are creating a new user using the userModel and putting the hashed password instead of the plain password. Then we are saving that newUser in the database. If it is successfully saved, we are returning the newUser details as a json. If an error occurs, we are showing the error message.
};
