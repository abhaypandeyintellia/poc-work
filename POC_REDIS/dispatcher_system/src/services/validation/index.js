
import { logger } from "../../utils/logger.js";

export function validate(schema, data) {
  const result = schema.safeParse(data);

  if (!result.success) {
    logger.error({
      errors: result.error.issues,
      payload: data
    }, "Validation failed");

    return null;
  }

  return result.data; // sanitized + typed
}