import { z } from "zod";

export const registerEntity = z.object({
  name: z.string().nonempty({ message: "Name is required" }),
  email: z.string().email({ message: "Valid email is required" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export const loginEntity = z.object({
  email: z.string().email({ message: "Valid email is required" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export type registerDTO = z.infer<typeof registerEntity>;
export type loginDTO = z.infer<typeof loginEntity>;