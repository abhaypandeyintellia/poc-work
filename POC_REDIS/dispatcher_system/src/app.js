import express from "express";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFound } from "./middleware/not-found.js";
import { requestId } from "./middleware/request-id.js";
import { requestLogger } from "./middleware/request-logger.js";
import routes from "./routes/index.js";

export const buildApp = () => {
  const app = express();

  app.disable("x-powered-by");
  app.set("env", env.NODE_ENV);

  app.use(express.json({ limit: "1mb" }));
  app.use(requestId);
  app.use(requestLogger);

  app.use(routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
