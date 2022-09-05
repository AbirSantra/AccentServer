// ! This files contains all the controllers related to authentication
// These are basically the logic that is carried out when a specific route is called.

import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//! Registering a new user
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
    const existingUser = await userModel.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ message: "Username is already taken!" });
    }

    const user = await newUser.save();

    const token = jwt.sign(
      {
        // creating the token using username and id
        username: user.username,
        id: user._id,
      },
      process.env.JWT_SECRET, // token secret
      { expiresIn: "1h" } // time to live of token
    );

    res.status(200).json({ user, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }

  // Here we are receiving the user details from the frontend in req.body.
  // Then we are using bcrypt to generate a salt for the password and then using that salt to generate a hashed password for the user.
  // Then we are creating a new user using the userModel and putting the hashed password instead of the plain password.
  // Check if the username is already taken and return error message if yes.
  // Then we are saving that newUser in the database.
  // Create a jwt token for the new user.
  // If it is successfully saved, we are returning the new user and the token
  // If an error occurs, we are showing the error message.
};

//! Loging in an Exisiting User
export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await userModel.findOne({ username: username });

    if (user) {
      const validity = await bcrypt.compare(password, user.password);

      if (!validity) {
        res.status(400).json({
          message: "Wrong Password! Please check your password and try again.",
        });
      } else {
        const token = jwt.sign(
          {
            username: user.username,
            id: user._id,
          },
          process.env.JWT_SECRET, // token secret
          { expiresIn: "1h" } // time to live of token
        );

        res.status(200).json({ user, token });
      }
    } else {
      res.status(404).json({ message: "User does not exist!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }

  // Receive the username and pass from the frontend through req.body
  // Try to search for the username in the database.
  // If the user exists in the database, check for the password.
  // 'Validity' returns a boolean of whether the entered password matches with the hashed password
  // If validity is true, it means the passwords match; create a token and return
  // Else if the validity is false, it means the passwords do not match; Return "Wrong Password" error message
  // Else if the user doesn't exist in the database, then return "Wrong Username" error message.
  // If any other error, return server error message.
};
