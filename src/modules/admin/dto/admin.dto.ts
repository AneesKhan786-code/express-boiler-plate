import { z } from "zod";

export const createCategoryDto = z.object({
  name: z.string().min(2)
});

export const createProductDto = z.object({
  name: z.string().min(2),
  price: z.number().min(1),
  category_id: z.number()
});
