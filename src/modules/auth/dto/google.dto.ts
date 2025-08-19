// src/modules/auth/dto/google.dto.ts
import { z } from "zod";

export const googleLoginDto = z.object({
  token: z.string().min(10, "Invalid Google token"), // id_token from frontend
});
export type GoogleLoginInput = z.infer<typeof googleLoginDto>;
