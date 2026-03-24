import { connectRedis, disconnectRedis, redisClient } from "../../services/redis/client.js";
import { STREAMS_DATA } from "../../utils/constants.js";
import { logger } from "../../utils/logger.js";
import { processEvent } from "./processor.js";

let shouldRun = true;

export const stopWorker = () => {
  shouldRun = false;
};

export const startWorker = async () => {
  await connectRedis();

  try {
    await redisClient.xGroupCreate(
      STREAMS_DATA.STREAM_KEY,
      STREAMS_DATA.GROUP_NAME,
      "0",
      { MKSTREAM: true }
    );
    logger.info("Worker started, group created");
  } catch (err) {
    if (err?.message?.includes("BUSYGROUP")) {
      logger.info("Worker started, group already exists");
    } else {
      logger.error({ err }, "Error starting worker");
      throw err;
    }
  }

  while (shouldRun) {
    try {
      const response = await redisClient.xReadGroup(
        STREAMS_DATA.GROUP_NAME,
        STREAMS_DATA.CONSUMER_NAME,
        [
          {
            key: STREAMS_DATA.STREAM_KEY,
            id: ">"
          }
        ],
        { COUNT: 1, BLOCK: 5000 }
      );

      if (!response) {
        continue;
      }

      for (const stream of response) {
        for (const message of stream.messages) {
          logger.info({ message }, "Received message");
          try {
            await processEvent(message);
            await redisClient.xAck(
              STREAMS_DATA.STREAM_KEY,
              STREAMS_DATA.GROUP_NAME,
              message.id
            );
          } catch (error) {
            logger.error({ error }, "Error acknowledging message");
          }
        }
      }
    } catch (err) {
      logger.error({ err }, "Worker loop error");
    }
  }

  await disconnectRedis();
};
