import { logger } from "../../utils/logger.js";
import { startWorker, stopWorker } from "./worker.js";

const shutdown = async (signal) => {
  logger.info({ signal }, "Stopping worker");
  stopWorker();
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

startWorker().catch((err) => {
  logger.error({ err }, "Worker failed");
  process.exit(1);
});
