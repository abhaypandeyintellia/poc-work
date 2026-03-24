import { ZodError } from "zod";
import { env } from "../config/env.js";
import { AppError, ValidationError } from "../utils/error.js";
import { logger } from "../utils/logger.js";

export const errorHandler = (err, req, res, _next) => {
  let normalizedError = err;

  if (err instanceof ZodError) {
    normalizedError = new ValidationError("Validation failed", err.issues);
  } else if (!(err instanceof AppError)) {
    normalizedError = new AppError("Internal Server Error");
  }

  const { statusCode, code, details } = normalizedError;

  logger.error(
    {
      err: normalizedError,
      req: {
        id: req.id,
        method: req.method,
        url: req.originalUrl
      }
    },
    "Request failed"
  );

  const responseBody = {
    error: {
      code,
      message: normalizedError.message,
      details: details ?? undefined
    }
  };

  if (env.NODE_ENV !== "production") {
    responseBody.error.stack = normalizedError.stack;
  }

  res.status(statusCode).json(responseBody);
};
