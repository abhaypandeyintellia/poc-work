import { z } from "zod";

export const todoSchema = z.object({
    title: z
        .string()
        .min(1, "Title required")
        .max(120)
        .trim()
});