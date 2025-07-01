import { z } from "zod";

export const createJobDto = z.object({
  title: z.string(),
  salary: z.number().nonnegative(),
});
