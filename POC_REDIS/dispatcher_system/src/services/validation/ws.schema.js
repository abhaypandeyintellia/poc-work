import { z } from "zod";

export const JoinRideSchema = z.object({
  type: z.literal("JOIN_RIDE"),
  rideId: z.string().min(1)
});