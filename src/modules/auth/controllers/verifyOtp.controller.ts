// src/modules/auth/controllers/verifyOtp.controller.ts
import { Request, Response, NextFunction } from "express";
import pool from "@/adapters/postgres/postgres.adapter";
import redisClient from "@/adapters/redis/redis.adapter";
import { HttpError } from "@/lib/fn-error";
import { asyncWrapper } from "@/lib/fn-wrapper";
import { generateAccessToken, generateRefreshToken } from "@/utils/jwt";

export const verifyOtpController = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const { email, otp } = req.body;

  const userDataRaw = await redisClient.get(`signup:${email}`);
  if (!userDataRaw) return next(new HttpError("OTP expired or not found", 404));

  const userData = JSON.parse(userDataRaw);
  if (userData.otp !== otp) return next(new HttpError("Invalid OTP", 400));

  const now = new Date();
  const expiry = new Date(userData.otpExpiry);
  if (now > expiry) return next(new HttpError("OTP expired", 400));

  const {
    rows: [user],
  } = await pool.query(
    `INSERT INTO users (name, email, password, role, verified) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING id, email, role`,
    [userData.name, userData.email, userData.password, userData.role, true]
  );

  await redisClient.del(`signup:${email}`);

  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  res
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      path: "/api/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000, 
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
