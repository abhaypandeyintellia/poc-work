import { STREAMS_DATA } from "../../utils/constants.js";
import { subClient } from "../../services/redis/client.js";
import { logger } from "../../utils/logger.js";
import { emitToRoom } from "../../ws/room.manager.js";
import { RideAcceptedSchema } from "../../services/validation/ride.schema.js";
import { validate } from "../../services/validation/index.js";

export async function initSubscriber() {

    await subClient.subscribe(STREAMS_DATA.CHANNEL, (message) => {

         const parsed = JSON.parse(message);

        const event = validate(RideAcceptedSchema, parsed);
        if (!event) return;

        logger.info({event}, "Emitting event to channel");

        const rideId = `ride:${event.rideId}`;

        emitToRoom(rideId, event);
    });

    logger.info("Subscriber initialized and listening to channel");
}