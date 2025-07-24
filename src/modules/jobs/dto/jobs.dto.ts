import { z } from "zod";

export const createJobDto = z.object({
  title: z.string().min(2),
  salary: z.number().nonnegative(),
  user_id: z.string().uuid().optional(), 
});

export const updateJobDto = z.object({
  title: z.string().min(2).optional(),
  salary: z.number().nonnegative().optional(),
});
