import { z } from "zod";

export const verifyOtpSchema = z.object({
  email: z.string().email({ message: "Valid email required" }),
  otp: z.string().length(6, { message: "OTP must be exactly 6 digits" }),
});

export type VerifyOtpDto = z.infer<typeof verifyOtpSchema>;
