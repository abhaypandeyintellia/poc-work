import { createClient } from "redis";

export const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379"
});

export const pubClient = redisClient.duplicate();
export const subClient = redisClient.duplicate();

redisClient.on("error", (err) => {
  logger.error("Redis Client Error", err);
});

export const connectRedis = async () => {
  await redisClient.connect();
  await pubClient.connect();
  await subClient.connect();
  logger.info("Connected to Redis");
};

connectRedis().catch((err) => {
  logger.error("Failed to connect to Redis", err);
  process.exit(1);
});