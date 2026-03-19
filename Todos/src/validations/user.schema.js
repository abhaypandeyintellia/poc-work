import { z } from "zod";

export const registerSchema = z.object({
    username: z
        .string()
        .trim(),

    password: z
        .string()
        .min(8, "Password must contain atleast 8 characters.")
        .max(16, "Password must not exceed 16 characters.")
        .regex(/[a-z]/, "Must contain small alphabets.")
        .regex(/[A-Z]/, "Must contain capital alphabets.")
        .regex(/[0-9]/, "Must contain numbers."),
});