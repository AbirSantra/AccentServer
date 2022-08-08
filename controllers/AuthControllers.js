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
};
