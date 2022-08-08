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

  // Here we are receiving the user details from the frontend in req.body.
  // Then we are using bcrypt to generate a salt for the password and then using that salt to generate a hashed password for the user.
  // Then we are creating a new user using the userModel and putting the hashed password instead of the plain password.
  // Then we are saving that newUser in the database.
  // If it is successfully saved, we are returning the newUser details as a json.
  // If an error occurs, we are showing the error message.
};

// Loging in an Exisiting User
export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await userModel.findOne({ username: username });

    if (existingUser) {
      const validity = await bcrypt.compare(password, existingUser.password);

      if (validity) {
        res.status(200).json(existingUser);
      } else {
        res
          .status(400)
          .json("Wrong Password! Please check your password and try again.");
      }
    } else {
      res.status(404).json("User does not exist! Please register.");
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }

  // Receive the username and pass from the frontend through req.body
  // Try to search for the username in the database.
  // If the user exists in the database, check for the password.
  // 'Validity' returns a boolean of whether the entered password matches with the hashed password
  // If validity is true, it means the passwords match; return the logged in user.
  // Else if the validity is false, it means the passwords do not match; Return "Wrong Password" error message
  // Else if the user doesn't exist in the database, then return "Wrong Username" error message.
  // If any other error, return server error message.
};
