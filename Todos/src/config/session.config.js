import session from "express-session";
import { RedisStore } from "connect-redis";
import { redisClient } from "./redisClient.js";

const store = new RedisStore({
    client: redisClient,
    prefix: "sess:"
});

const isProduction = process.env.NODE_ENV === "production";

export const sessionConfig = session({
    store,
    name: "sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie:{
        httpOnly: true,
        maxAge: 1000 * 60 * 60,
        sameSite: isProduction ? "none" : "lax",
        secure: isProduction
    }
});
