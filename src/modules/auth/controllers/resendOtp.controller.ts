import { Request, Response, NextFunction } from "express";
import { asyncWrapper } from "../../../lib/fn-wrapper";
import { HttpError } from "../../../lib/fn-error";
import { generateOtp, generateOtpExpiry } from "@/utils/otp";
import { sendOtpToEmail } from "@/modules/user/services/mail.service";
import redisClient from "@/adapters/redis/redis.adapter";
import {db} from "../../../drizzle/db"
import { users } from "../../../drizzle/schema/users"; 
import { eq } from "drizzle-orm"; 

export const resendOtpController = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;

  const user = await db
    .select({
      id: users.id,
      name: users.name,
      verified: users.verified,
      password: users.password,
      role: users.role,
    })
    .from(users)
    .where(eq(users.email, email))
    .then(rows => rows[0]);

  if (!user) return next(new HttpError("User not found", 404));
  if (user.verified) return next(new HttpError("User is already verified", 400));

  const otp = generateOtp();
  const otpExpiry = generateOtpExpiry();

  const redisPayload = JSON.stringify({
    email,
    name: user.name,
    password: user.password,
    role: user.role,
    otp,
    otpExpiry,
  });

  await redisClient.setex(`signup:${email}`, 300, redisPayload);
  await sendOtpToEmail({ email, name: user.name, otp });

  res.status(200).json({ message: "OTP resent successfully. Please check your email." });
});
