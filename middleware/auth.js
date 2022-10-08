import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const secret = process.env.JWT_SECRET;

const auth = async (req, res, next) => {
	try {
		const token = req.headers.authorization.split(" ")[1];

		if (token) {
			const decodedData = jwt.verify(token, secret);

			req.body._id = decodedData?.id;
		}
		next();
	} catch (error) {
		console.log(error);
	}
};

export default auth;
