import { z } from "zod";

export const RideAcceptedSchema = z.object({
  type: z.literal("RIDE_ACCEPTED"),
  rideId: z.string().min(1),
  driverId: z.string().min(1),
  riderId: z.string().min(1),
  timestamp: z.number()
});