import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/async-handler.js";
import { validate } from "../middleware/validate.js";
import { createStream } from "../services/redis/stream.js";

const router = Router();

const eventSchema = z
  .object({
    type: z.string().min(1),
    rideId: z.string().min(1),
    payload: z.record(z.any()).optional()
  })
  .strict();

router.post(
  "/events",
  validate({ body: eventSchema }),
  asyncHandler(async (req, res) => {
    const event = {
      type: req.body.type,
      rideId: req.body.rideId,
      payload: JSON.stringify(req.body.payload ?? {}),
      createdAt: new Date().toISOString()
    };

    await createStream(event);

    res.status(202).json({
      status: "accepted",
      type: event.type,
      rideId: event.rideId
    });
  })
);

export default router;
