import { Request, Response, NextFunction } from "express";
import pool from "@/adapters/postgres/postgres.adapter";
import { asyncWrapper } from "@/lib/fn-wrapper";
import { HttpError } from "@/lib/fn-error";
import { generateOtp, generateOtpExpiry } from "@/utils/otp";
import { sendOtpToEmail } from "@/modules/user/services/mail.service";
import redisClient from "@/adapters/redis/redis.adapter"; // ✅ Redis import

export const resendOtpController = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;

  const {
    rows: [user],
  } = await pool.query("SELECT id, name, verified, password, role FROM users WHERE email = $1", [email]);

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
