import { pubClient } from "../../services/redis/client.js";
import { validate } from "../../services/validation/index.js";
import { RideAcceptedSchema } from "../../services/validation/ride.schema.js";
import { STREAMS_DATA } from "../../utils/constants.js";
import { logger } from "../../utils/logger.js";

export async function processEvent(event) {
  const raw = event.message ?? event;

   const message = validate(RideAcceptedSchema, {
    ...raw,
    timestamp: Date.now()
  });

  if (!message) return;

  logger.info({ message }, "Processing event");

  await pubClient.publish(
    STREAMS_DATA.CHANNEL, 
    JSON.stringify(message)
  );
}
