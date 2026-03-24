import { createClient } from "redis";
import { env } from "../../config/env.js";
import { logger } from "../../utils/logger.js";

export const redisClient = createClient({
  url: env.REDIS_URL
});

export const pubClient = redisClient.duplicate();
export const subClient = redisClient.duplicate();

const clients = [redisClient, pubClient, subClient];

clients.forEach((client) => {
  client.on("error", (err) => {
    logger.error({ err }, "Redis client error");
  });
});

export const connectRedis = async () => {
  await Promise.all(
    clients.map(async (client) => {
      if (!client.isOpen) {
        await client.connect();
      }
    })
  );

  logger.info("Connected to Redis");
};

export const disconnectRedis = async () => {
  await Promise.all(
    clients.map(async (client) => {
      if (client.isOpen) {
        await client.quit();
      }
    })
  );

  logger.info("Disconnected from Redis");
};
