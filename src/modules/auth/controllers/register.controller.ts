import { HttpError } from "../../../lib/fn-error";
import { asyncWrapper } from "../../../lib/fn-wrapper";
import { registerEntity } from "../dto/auth.dto";
import { hash } from "bcryptjs";
import { generateOtp, generateOtpExpiry } from "@/utils/otp";
import { sendOtpToEmail } from "../../user/services/mail.service";
import redisClient from "@/adapters/redis/redis.adapter";
import { db } from "../../../drizzle/db";
import { users } from "../../../drizzle/schema/users";
import { eq } from "drizzle-orm";

export const signup = asyncWrapper(async (req, res, next) => {

  let { name, email, password } = req.body;
  const normalizedEmail = email.toLowerCase();

  const existing = await db.select().from(users).where(eq(users.email, normalizedEmail));
  if (existing.length > 0)
    return next(new HttpError("Email already exists", 409));

  const adminExists = await db.select().from(users).where(eq(users.role, "admin"));
  let finalRole = "user";
  if (adminExists.length === 0) {
    finalRole = "admin"; 
  }

  let hashedPassword: string | null = null;
  if (password) {
    hashedPassword = await hash(password, 10);
  }

  const otp = generateOtp();
  const otpExpiry = generateOtpExpiry();

  const redisPayload = JSON.stringify({
    name,
    email: normalizedEmail,
    password: hashedPassword,
    role: finalRole,
    otp,
    otpExpiry,
  });
  await redisClient.setex(`signup:${normalizedEmail}`, 300, redisPayload);

  if (password) {
    await sendOtpToEmail({ email: normalizedEmail, name, otp });
  }
  res.status(200).json({
    message: password
      ? "OTP sent to your email. Please verify to complete signup."
      : "Google signup detected. Complete flow with Google login.",
    assignedRole: finalRole,
  });
});