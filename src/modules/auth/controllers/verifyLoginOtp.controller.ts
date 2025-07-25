import { Request, Response, NextFunction } from "express";
import { asyncWrapper } from "@/lib/fn-wrapper";
import { HttpError } from "@/lib/fn-error";
import redisClient from "@/adapters/redis/redis.adapter";
import pool from "@/adapters/postgres/postgres.adapter";
import { generateAccessToken, generateRefreshToken } from "@/utils/jwt";

export const verifyLoginOtp = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const { email, otp } = req.body;
  const normalizedEmail = email.toLowerCase();

  const redisData = await redisClient.get(`login-otp:${normalizedEmail}`);
  if (!redisData) return next(new HttpError("OTP expired or invalid", 400));

  const { otp: correctOtp, otpExpiry, user } = JSON.parse(redisData);

  if (otp !== correctOtp) return next(new HttpError("Incorrect OTP", 400));
  if (new Date() > new Date(otpExpiry)) return next(new HttpError("OTP expired", 400));

  await pool.query(`UPDATE users SET verified = true WHERE email = $1`, [normalizedEmail]);
  await redisClient.del(`login-otp:${normalizedEmail}`);

  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

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