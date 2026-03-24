import { STREAMS_DATA } from "../../utils/constants.js";
import { logger } from "../../utils/logger.js";
import { redisClient } from "./client.js";

export async function createStream(event) {
  try {
    const fields = Object.fromEntries(
      Object.entries(event).map(([key, value]) => {
        if (value === undefined) {
          return [key, ""];
        }

        return [key, typeof value === "string" ? value : JSON.stringify(value)];
      })
    );

    await redisClient.xAdd(STREAMS_DATA.STREAM_KEY, "*", fields);
  } catch (err) {
    logger.error({ err, event }, "Error creating stream");
    throw err;
  }
}
