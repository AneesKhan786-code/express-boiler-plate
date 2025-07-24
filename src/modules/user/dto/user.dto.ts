import { z } from "zod";

export const createUserDto = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

export type CreateUserInput = z.infer<typeof createUserDto>;