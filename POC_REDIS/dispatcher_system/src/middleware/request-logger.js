import { logger } from "../utils/logger.js";

export const requestLogger = (req, res, next) => {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    logger.info(
      {
        req: {
          id: req.id,
          method: req.method,
          url: req.originalUrl
        },
        res: {
          statusCode: res.statusCode
        },
        durationMs: Number(durationMs.toFixed(2))
      },
      "Request completed"
    );
  });

  next();
};
