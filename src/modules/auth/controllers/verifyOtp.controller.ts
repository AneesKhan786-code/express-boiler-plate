// src/modules/auth/controllers/verifyOtp.controller.ts
import { Request, Response, NextFunction } from "express";
import redisClient from "@/adapters/redis/redis.adapter";
import { HttpError } from "../../../lib/fn-error";
import { asyncWrapper } from "../../../lib/fn-wrapper";
import { generateAccessToken, generateRefreshToken } from "../../../utils/jwt";
import { db } from "../../../drizzle/db";
import { users } from "../../../drizzle/schema/users";
import { eq } from "drizzle-orm";

export const verifyOtpController = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const { email, otp } = req.body;
  if (!email || !otp) return next(new HttpError("Email and OTP are required", 400));

  const normalizedEmail = email.toLowerCase().trim();
  const signupKey = `signup:${normalizedEmail}`;
  const loginKey = `login-otp:${normalizedEmail}`;

  // Try both keys (signup first, then login)
  const [signupRaw, loginRaw] = await Promise.all([
    redisClient.get(signupKey),
    redisClient.get(loginKey),
  ]);

  if (!signupRaw && !loginRaw) {
    return next(new HttpError("OTP expired or not found", 404));
  }

  // ---------- SIGNUP FLOW ----------
  if (signupRaw) {
    const parsed = JSON.parse(signupRaw);
    const correctOtp = String(parsed.otp);
    const otpExpiry = new Date(parsed.otpExpiry);

    if (String(otp) !== correctOtp) return next(new HttpError("Invalid OTP", 400));
    if (new Date() > otpExpiry) return next(new HttpError("OTP expired", 400));

    // Extra-safety: check if user was created in the meantime
    const existing = await db.select().from(users).where(eq(users.email, normalizedEmail));
    if (existing.length) {
      // cleanup redis and tell user
      await redisClient.del(signupKey);
      return next(new HttpError("Email already registered", 409));
    }

    const [newUser] = await db.insert(users).values({
      name: parsed.name,
      email: normalizedEmail,
      password: parsed.password, // hashed already
      role: parsed.role,
      verified: true,
    }).returning({
      id: users.id,
      email: users.email,
      role: users.role,
    });

    await redisClient.del(signupKey);

    const payload = { id: newUser.id, email: newUser.email, role: newUser.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Signup OTP verified successfully. You are now logged in.",
      accessToken,
      user: payload,
    });
  }

  // ---------- LOGIN FLOW ----------
  // loginRaw exists (signupRaw is falsy)
  const parsedLogin = JSON.parse(loginRaw as string);
  const correctOtp = String(parsedLogin.otp);
  const otpExpiry = new Date(parsedLogin.otpExpiry);

  if (String(otp) !== correctOtp) return next(new HttpError("Invalid OTP", 400));
  if (new Date() > otpExpiry) return next(new HttpError("OTP expired", 400));

  // Fetch latest user from DB (safer than trusting redis user payload)
  const [dbUser] = await db.select().from(users).where(eq(users.email, normalizedEmail));
  if (!dbUser) {
    await redisClient.del(loginKey);
    return next(new HttpError("User not found", 404));
  }

  // mark as verified if not already
  if (!dbUser.verified) {
    await db.update(users).set({ verified: true }).where(eq(users.email, normalizedEmail));
  }

  await redisClient.del(loginKey);

  const payload = { id: dbUser.id, email: dbUser.email, role: dbUser.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/refresh",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    message: "Login OTP verified successfully.",
    accessToken,
    user: payload,
  });
});
