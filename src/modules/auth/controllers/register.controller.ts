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
  // const parsed = registerEntity.safeParse(req.body);
  // if (!parsed.success) return next(new HttpError("Invalid input", 400));

  const { name, email, password } = req.body;

  // 1. Email already exists?
  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length > 0)
    return next(new HttpError("Email already exists", 409));

  // 2. Check if any admin already exists
  const adminExists = await db.select().from(users).where(eq(users.role, "admin"));

  let finalRole = "user";
  if (adminExists.length === 0) {
    finalRole = "admin"; // Pehla signup hoga to admin banega
  }

  // 3. Password hash
  const hashedPassword = await hash(password, 10);

  // 4. OTP generate
  const otp = generateOtp();
  const otpExpiry = generateOtpExpiry();

  // 5. Data Redis me store
  const redisPayload = JSON.stringify({
    name,
    email,
    password: hashedPassword,
    role: finalRole,
    otp,
    otpExpiry,
  });

  await redisClient.setex(`signup:${email}`, 300, redisPayload); // 300 = 5 min expiry

  // 6. OTP email bhejna
  await sendOtpToEmail({ email, name, otp });

  res.status(200).json({
    message: `OTP sent to your email. Please verify to complete signup.`,
    assignedRole: finalRole
  });
});
