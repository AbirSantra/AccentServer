import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
	// Check for authorization headers
	const authHeader = req.headers.authorization || req.headers.Authorization;

	// If header unavailable
	if (!authHeader?.startsWith("Bearer ")) {
		return res.status(401).json({
			message: "Auth Header not found or does not start with Bearer!",
		});
	}

	// Extract the token
	const token = authHeader.split(" ")[1];

	// Check the token
	jwt.verify(token, process.env.ACCESS_SECRET, async (err, decoded) => {
		if (err) {
			return res.status(403).json({ message: "Access Token expired!" });
		}

		req.body.userId = decoded.id;

		next();
	});
};

export default auth;
