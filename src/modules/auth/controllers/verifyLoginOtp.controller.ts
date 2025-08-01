// src/modules/auth/controllers/verifyLoginOtp.controller.ts

import { Request, Response, NextFunction } from "express";
import { asyncWrapper } from "@/lib/fn-wrapper";
import { HttpError } from "@/lib/fn-error";
import redisClient from "@/adapters/redis/redis.adapter";
import { generateAccessToken, generateRefreshToken } from "../../../utils/jwt";
import { db } from "@/db/drizzle"; // ✅ drizzle instance
import { users } from "@/db/schema/users"; // ✅ users schema
import { eq } from "drizzle-orm"; // ✅ condition builder

export const verifyLoginOtp = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const { email, otp } = req.body;
  const normalizedEmail = email.toLowerCase();

  // ✅ Step 1: Get data from Redis
  const redisData = await redisClient.get(`login-otp:${normalizedEmail}`);
  if (!redisData) return next(new HttpError("OTP expired or invalid", 400));

  const { otp: correctOtp, otpExpiry, user } = JSON.parse(redisData);

  // ✅ Step 2: Check OTP match
  if (otp !== correctOtp) return next(new HttpError("Incorrect OTP", 400));
  if (new Date() > new Date(otpExpiry)) return next(new HttpError("OTP expired", 400));

  // ✅ Step 3: Update user as verified using Drizzle
  await db.update(users)
    .set({ verified: true })
    .where(eq(users.email, normalizedEmail));

  // ✅ Step 4: Delete Redis key
  await redisClient.del(`login-otp:${normalizedEmail}`);

  // ✅ Step 5: Generate tokens
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // ✅ Step 6: Send tokens in response
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    path: "/api/refresh",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    message: "OTP verified. Login successful.",
    accessToken,
    user: payload,
  });
});
