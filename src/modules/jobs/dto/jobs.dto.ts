import { z } from "zod";

export const createJobDto = z.object({
  title: z.string().min(2),
  description: z.string().min(5),
  salary: z.number().nonnegative(),
  user_id: z.string().uuid().optional(), 
});

export const updateJobDto = z.object({
  title: z.string().min(2).optional(),
  description: z.string().min(5),
  salary: z.number().nonnegative().optional(),
});
