import { buildApp } from "./app.js";
import { env } from "./config/env.js";
import { connectRedis, disconnectRedis } from "./services/redis/client.js";
import { logger } from "./utils/logger.js";

const startServer = async () => {
  await connectRedis();

  const app = buildApp();
  const server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, "Server started");
  });

  const shutdown = async (signal) => {
    logger.info({ signal }, "Shutting down");
    server.close(() => {
      logger.info("HTTP server closed");
    });

    await disconnectRedis();
    process.exit(0);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
};

startServer().catch((err) => {
  logger.error({ err }, "Startup failed");
  process.exit(1);
});
