import { randomUUID } from "crypto";

export const requestId = (req, res, next) => {
  const headerId = req.headers["x-request-id"];
  const id = typeof headerId === "string" && headerId.length > 0 ? headerId : randomUUID();

  req.id = id;
  res.setHeader("x-request-id", id);
  next();
};
