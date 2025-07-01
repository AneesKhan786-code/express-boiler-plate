// ✅ Correct DTO: DO NOT ask for user_id from body
import { z } from "zod";

export const createExpenseDto = z.object({
  amount: z.number().positive(),
  description: z.string().min(1),
});

export type CreateExpenseInput = z.infer<typeof createExpenseDto>;
