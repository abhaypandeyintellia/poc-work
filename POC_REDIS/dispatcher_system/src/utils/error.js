export class AppError extends Error {
  constructor(message, { statusCode = 500, code = "INTERNAL_ERROR", details } = {}) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not Found") {
    super(message, { statusCode: 404, code: "NOT_FOUND" });
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation Error", details) {
    super(message, { statusCode: 400, code: "VALIDATION_ERROR", details });
  }
}
