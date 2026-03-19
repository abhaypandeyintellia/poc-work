import dotenv from "dotenv";
import { createClient } from "redis";

dotenv.config();

export const redisClient = createClient({
    url: process.env.REDIS_URL
})

redisClient.on("error", err => {
    console.log("Redis client error: ", err);
});

await redisClient.connect();