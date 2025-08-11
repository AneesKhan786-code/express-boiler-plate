import { z } from "zod";

export const createCategoryDto = z.object({
  name: z.string().min(1),
});

export const createProductDto = z.object({
  name: z.string().min(1),
  price: z.number().nonnegative(),
  category_id: z.string().uuid(), 
});