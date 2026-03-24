import { validate } from "../../../services/validation/index.js";
import { JoinRideSchema } from "../../../services/validation/ws.schema.js";
import { logger } from "../../../utils/logger.js";
import { joinRoom } from "../../../ws/room.manager.js";

export function handleConnection(ws){
    ws.on('message', (data) =>{
        try {
            const parsed = JSON.parse(data);

            const msg = validate(JoinRideSchema, parsed);
            if (!msg) return;

            if(msg.type === 'JOIN_RIDE'){
                const rideId = `ride:${msg.rideId}`;
                joinRoom(ws, rideId);
                logger.info(`Client joined room ${rideId}`);

            }
        } catch (error) {
            logger.error('Error parsing message:', error);
        }
    } )
}