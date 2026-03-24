import { REDISEARCH_LANGUAGE } from "redis";
import { redisClient, connectRedis } from "../../services/redis/client.js";
import { STREAMS_DATA } from "../../utils/constants.js";
import { logger } from "../../utils/logger.js";
import { processEvent } from "./processor.js";

export async function startConsumer(){
    await connectRedis();

    try {
        await redisClient.xGroupCreate(
            STREAMS_DATA.STREAM_KEY,
            STREAMS_DATA.GROUP_NAME,
            "0",
            {
                MKSTREAM: true
            }
        );
        logger.info("Consumer group created successfully");
    } catch (error) {
        if (error?.message?.includes("BUSYGROUP")) {
            logger.info("Consumer group already exists");
        } else {
            logger.error(`Error starting consumer: ${error.message}`);
        }
    }

    while(true){
        const response = await redisClient.xReadGroup(
            STREAMS_DATA.GROUP_NAME,
            STREAMS_DATA.CONSUMER_NAME,
            [{
                key: STREAMS_DATA.STREAM_KEY,
                id: ">"
            }],
            {
                COUNT: 5,
                BLOCK: 5000
            }
        );

        if(!response){
            continue;
        }

        for(const stream of response){
            for(const message of stream.messages){
                const id = message.id;

               try {
                 await processEvent(message);
 
                 await redisClient.xAck(
                     STREAMS_DATA.STREAM_KEY,
                     STREAMS_DATA.GROUP_NAME,
                     id
                 );
               } catch (error) {
                 logger.error(`Error processing event: ${error.message}`);
               }
            }
        }
    }
}

startConsumer().catch((err) => {
    logger.error({ err }, "Consumer failed");
    process.exit(1);
});