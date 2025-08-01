// src/modules/auth/controllers/verifyOtp.controller.ts
import { Request, Response, NextFunction } from "express";
import redisClient from "@/adapters/redis/redis.adapter";
import { HttpError } from "@/lib/fn-error";
import { asyncWrapper } from "@/lib/fn-wrapper";
import { generateAccessToken, generateRefreshToken } from "@/utils/jwt";
import { db } from "@/db/drizzle"; // ✅ drizzle instance
import { users } from "@/db/schema/users"; // ✅ users schema
import { eq } from "drizzle-orm"; // ✅ for condition

export const verifyOtpController = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const { email, otp } = req.body;

  // ✅ Step 1: OTP check from Redis
  const userDataRaw = await redisClient.get(`signup:${email}`);
  if (!userDataRaw) return next(new HttpError("OTP expired or not found", 404));

  const userData = JSON.parse(userDataRaw);
  if (userData.otp !== otp) return next(new HttpError("Invalid OTP", 400));

  const now = new Date();
  const expiry = new Date(userData.otpExpiry);
  if (now > expiry) return next(new HttpError("OTP expired", 400));

  // ✅ Step 2: Insert into PostgreSQL using Drizzle ORM
  const [user] = await db
    .insert(users)
    .values({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role,
      verified: true,
    })
    .returning({
      id: users.id,
      email: users.email,
      role: users.role,
    });

  // ✅ Step 3: Clear OTP from Redis
  await redisClient.del(`signup:${email}`);

  // ✅ Step 4: Generate Tokens
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // ✅ Step 5: Send Response
  res
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      path: "/api/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
    .status(200)
    .json({
      message: "OTP verified successfully. You are now logged in.",
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
});
