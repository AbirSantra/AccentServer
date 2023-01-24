// ! This files contains all the controllers related to authentication

import userModel from "../models/userModel.js";
import bcrypt, { hash } from "bcrypt";
import jwt from "jsonwebtoken";

//! REGISTER USER
/**
 * @api {post} /auth/register Register a New User
 * @apiName Register User
 * @apiGroup Auth
 * @apiDescription This endpoint can be used to create a new user. This requires the new user's details to be passed in the request body. Returns a success message.
 *
 *
 * @apiBody {String} username Username of the user
 * @apiBody {String} firstname Firstname of the user
 * @apiBody {String} lastname Lastname of the user
 * @apiBody {String} email Email address of the user
 * @apiBody {String} password Password of the user
 *
 * @apiSuccessExample {json} Success-Response:
 * 200 OK
 * {
 * 		"message": "New user <Username> is successfully created!"
 * }
 *
 * @apiError 400 All fields are required
 * @apiError 409 Username is already taken or email address is already registered
 * @apiError 409 Email address is already registered.
 * @apiError (500) 500 Internal Server Error
 * @apiErrorExample {json} Error-Response Example:
 *     400
 *     {
 *       "message": "All fields are required!"
 *     }
 */
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
/**
 * @api {post} /auth/login Login an exisiting User
 * @apiName Login User
 * @apiGroup Auth
 * @apiDescription This endpoint can be used to login an existing user. This requires the user's auth details to be passed in the request body. Returns an object containing the user's details and an access token.
 *
 *
 * @apiBody {String} username Username of the user
 * @apiBody {String} password Password of the user
 *
 * @apiSuccessExample {json} Success-Response:
 * 200 OK
 * {
 * 		"user": {<User Details>},
 * 		"accessToken": <JWT Access Token>
 * }
 *
 * @apiError 400 Username or password missing
 * @apiError 404 User not found or user does not exist.
 * @apiError 401 Wrong password
 * @apiError (500) 500 Internal Server Error
 * @apiErrorExample {json} Error-Response Example:
 *     400
 *     {
 *       "message": "Username or password missing!"
 *     }
 */
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
			{ expiresIn: "1h" }
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
/**
 * @api {get} /auth/refresh Refresh access token
 * @apiName Refresh Token
 * @apiGroup Auth
 * @apiDescription This endpoint can be used to refresh the access token of an user (valid for 1 day). This requires a jwt token to be passed as a http only cookie along with the request. Returns an object containing the user's details and an access token.
 *
 *
 * @apiBody {String} jwt JWT refresh token sent as an http-only cookie
 *
 * @apiSuccessExample {json} Success-Response:
 * 200 OK
 * {
 * 		"user": {<User details>},
 * 		"accessToken": <JWT Access Token>
 * }
 *
 * @apiError 401 JWT cookie not found
 * @apiError 404 User is Unauthorized or does not exist.
 * @apiError (500) 500 Internal Server Error
 * @apiErrorExample {json} Error-Response Example:
 *     401
 *     {
 *       "message": "JWT not found!"
 *     }
 */
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
			return res.status(404).json({ message: "Unauthorized!" });
		}

		// Generate new access token
		const accessToken = jwt.sign(
			{
				username: user.username,
				id: user._id,
			},
			process.env.ACCESS_SECRET,
			{ expiresIn: "1h" }
		);

		// Send response
		res.status(200).json({ user, accessToken });
	});
};

//! LOGOUT USER
/**
 * @api {get} /auth/logout Logout User
 * @apiName Logout User
 * @apiGroup Auth
 * @apiDescription This endpoint can be used to clear the cookies and essentially log the user out on the server side. It clears the cookies if they are present. Returns a success message.
 *
 *
 * @apiBody {String} jwt JWT refresh token sent as an http-only cookie
 *
 * @apiSuccessExample {json} Success-Response:
 * 200 OK
 * {
 * 		"message": "Cookies successfully cleared!"
 * }
 */
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
