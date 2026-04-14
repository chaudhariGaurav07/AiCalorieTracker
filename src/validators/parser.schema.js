import { z } from "zod";

export const parserSchema = z.object({
  body: z.object({
    text: z.string().min(2, "Meal text must be at least 2 characters long").max(500, "Meal text is too long")
  })
});
