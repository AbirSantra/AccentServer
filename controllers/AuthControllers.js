// ! This files contains all the controllers related to authentication
// These are basically the logic that is carried out when a specific route is called.

import userModel from "../models/userModel.js";
import bcrypt, { hash } from "bcrypt";
import jwt from "jsonwebtoken";

//! REGISTER USER
export const registerUser = async (req, res) => {
	const { username, email, password, firstname, lastname } = req.body;

	// Check if all fields are present
	if (!username || !email || !password || !firstname || !lastname) {
		return res.status(400).json({ message: "All fields are required!" });
	}

	try {
		// Check if username exists
		const existingUsername = await userModel.findOne({ username });
		if (existingUsername) {
			return res.status(409).json({ message: "Username is already taken!" });
		}

		// Check if email already exists
		const existingEmail = await userModel.findOne({ email });
		if (existingEmail) {
			return res
				.status(409)
				.json({ message: "This email is already registered!" });
		}

		// Hash the password
		const hashedPass = await bcrypt.hash(password, 10);

		// Create user model
		const user = new userModel({
			username,
			password: hashedPass,
			email,
			firstname,
			lastname,
		});

		// Save the user in database
		const newUser = await user.save();

		// Send response is user is created
		if (newUser) {
			res
				.status(200)
				.json({ message: `New user ${username} is successfully created!` });
		}
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

//! LOGIN USER
export const loginUser = async (req, res) => {
	const { username, password } = req.body;

	// Check if username or password is missing
	if (!username || !password) {
		return res.status(400).json({ message: "Username or Password missing!" });
	}

	try {
		// Find the user using username
		const user = await userModel.findOne({ username });

		// If user does not exist
		if (!user) {
			return res.status(404).json({ message: "User not found!" });
		}

		// Check for password validity
		const isPasswordValid = await bcrypt.compare(password, user.password);

		// If password is not valid
		if (!isPasswordValid) {
			return res.status(401).json({ message: "Wrong Password" });
		}

		// Generate Access Token
		const accessToken = jwt.sign(
			{
				username: user.username,
				id: user._id,
			},
			process.env.ACCESS_SECRET,
			{ expiresIn: "15m" }
		);

		// Generate Refresh Token
		const refreshToken = jwt.sign(
			{
				id: user._id,
			},
			process.env.REFRESH_SECRET,
			{ expiresIn: "1d" }
		);

		// Set refresh token as cookie
		res.cookie("jwt", refreshToken, {
			httpOnly: true,
			secure: true,
			sameSite: "None",
			maxAge: 24 * 60 * 60 * 1000,
		});

		// Send response
		res.status(200).json({
			user,
			accessToken,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

//! REFRESH ACCESS TOKEN
export const refresh = (req, res) => {
	// Get the cookie
	const cookies = req.cookies;

	// If jwt cookie does not exist
	if (!cookies?.jwt) {
		return res.status(401).json({ message: "JWT not found!" });
	}

	// Get the refresh token
	const refreshToken = cookies.jwt;

	// Verify token
	jwt.verify(refreshToken, process.env.REFRESH_SECRET, async (err, decoded) => {
		// If token expired
		if (err) {
			console.log(err);
			return res.status(401).json({ message: "Refresh token expired" });
		}

		// Check the contents of the token
		const user = await userModel.findById(decoded.id);

		// If user does not exist
		if (!user) {
			return res.status(401).json({ message: "Unauthorized!" });
		}

		// Generate new access token
		const accessToken = jwt.sign(
			{
				username: user.username,
				id: user._id,
			},
			process.env.ACCESS_SECRET,
			{ expiresIn: "15m" }
		);

		// Send response
		res.status(200).json({ user, accessToken });
	});
};

//! LOGOUT USER
export const logout = async (req, res) => {
	const cookies = req.cookies;

	// Check if cookies exist
	if (!cookies?.jwt) {
		return res.status(200).json({ message: "No cookies to clear" });
	}

	// Clear the existing cookies
	res.clearCookie("jwt", {
		httpOnly: true,
		secure: true,
		sameSite: "None",
	});

	// Send response
	res.status(200).json({ message: "Cookies successfully cleared!" });
};
