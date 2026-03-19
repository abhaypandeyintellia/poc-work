import express, { urlencoded } from "express"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser";
import session from "express-session";
import { connectDB } from "./config/db.js";
import routes from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import passport from "./config/passport.js";
import { notFound } from "./middlewares/notFound.middleware.js";
import { sessionConfig } from "./config/session.config.js";

dotenv.config()

const app = express();
connectDB();

const port = process.env.PORT ? process.env.PORT : 5000;
const isProduction = process.env.NODE_ENV === "production";

if (isProduction) {
    app.set("trust proxy", 1);
}

const corsOptions = {
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({limit: "10kb"}));
app.use(urlencoded({extended: true}));
app.use(cookieParser());
app.use(sessionConfig);
app.use(passport.initialize());
app.use(passport.session());
app.use("/api", routes);
app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
    console.log(`The app listening on http://localhost:${port}`);
    
})
