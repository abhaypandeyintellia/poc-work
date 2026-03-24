import { WebSocketServer } from "ws";
import { PORTS } from "../../utils/constants.js";
import { initSubscriber } from "./subscriber.js";
import { logger } from "../../utils/logger.js";
import { handleConnection } from "./handler/ws.handler.js";
import { connectRedis } from "../../services/redis/client.js";

const startServer = async () => {
    await connectRedis();

    const wss = new WebSocketServer({ port : PORTS.WS_SERVER });

    wss.on("connection", (ws) => {
        handleConnection(ws);
    });

    await initSubscriber();

    logger.info(`WebSocket server started on port ${PORTS.WS_SERVER}`);
};

startServer().catch((err) => {
    logger.error({ err }, "WebSocket server failed to start");
    process.exit(1);
});