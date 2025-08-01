import { HttpError } from "@/lib/fn-error";
import { asyncWrapper } from "@/lib/fn-wrapper";
import { registerEntity } from "../dto/auth.dto";
import { hash } from "bcryptjs";
import { generateOtp, generateOtpExpiry } from "@/utils/otp";
import { sendOtpToEmail } from "../../user/services/mail.service";
import redisClient from "@/adapters/redis/redis.adapter";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";

export const signup = asyncWrapper(async (req, res, next) => {
  const parsed = registerEntity.safeParse(req.body);
  if (!parsed.success) return next(new HttpError("Invalid input", 400));

  const { name, email, password } = parsed.data;

  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length > 0)
    return next(new HttpError("Email already exists", 409));

  const hashedPassword = await hash(password, 10);
  const otp = generateOtp();
  const otpExpiry = generateOtpExpiry();

  const redisPayload = JSON.stringify({
    name,
    email,
    password: hashedPassword,
    role: "user",
    otp,
    otpExpiry,
  });

  await redisClient.setex(`signup:${email}`, 300, redisPayload); // 300 = 5 min expiry
  await sendOtpToEmail({ email, name, otp });

  res.status(200).json({
    message: "OTP sent to your email. Please verify to complete signup.",
  });
});
