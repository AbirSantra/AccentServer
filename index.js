// Imports
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import AuthRoute from "./routes/AuthRoute.js";
import UserRoute from "./routes/UserRoute.js";
import PostRoute from "./routes/PostRoute.js";
import cookieParser from "cookie-parser";
import corsOptions from "./config/corsOptions.js";

// Initializing the app server
const app = express();
dotenv.config();

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.text({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cookieParser());

//Routes
app.use("/auth", AuthRoute); //-> Authentication Routes
app.use("/user", UserRoute); //-> User Action Routes
app.use("/post", PostRoute); //-> Post Actions Routes
app.use("/docs", express.static("./docs")); //--> API Documentation Routes

// MongoDB Atlas Connection
mongoose
	.connect(process.env.MONGO_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() =>
		app.listen(process.env.PORT, () =>
			console.log(`Server started at port ${process.env.PORT}`)
		)
	)
	.catch((error) => console.log(error));
