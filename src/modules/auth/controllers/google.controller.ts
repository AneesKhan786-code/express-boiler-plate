// src/modules/auth/controllers/google.controller.ts
import { Request, Response, NextFunction } from "express";
import { asyncWrapper } from "../../../lib/fn-wrapper";
import { HttpError } from "../../../lib/fn-error";
import { googleLoginDto } from "../dto/google.dto";
import { googleClient } from "../../../utils/google";
import { findOrCreateGoogleUser } from "../services/google.service";
import { generateAccessToken, generateRefreshToken } from "../../../utils/jwt";
import { generateOtp } from "../../../utils/otp";
import redisClient from "../../../adapters/redis/redis.adapter";
import { sendOtpToEmail } from "../../user/services/mail.service";

export const googleLoginController = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const parsed = googleLoginDto.safeParse(req.body);
  if (!parsed.success) return next(new HttpError("Invalid Google token", 400));

  const { token } = parsed.data;
  const ticket = await googleClient.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID!,
  });

  const payload = ticket.getPayload();
  if (!payload?.email || !payload?.sub) {
    return next(new HttpError("Google verification failed", 401));
  }

  const profile = {
    googleId: payload.sub,
    email: payload.email.toLowerCase(),
    name: payload.name ?? "Google User",
    verified: payload.email_verified === true,
  };

  const user = await findOrCreateGoogleUser(profile);

  // OTP flow if Google did not verify email
  if (!profile.verified && !user.verified) {
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    await redisClient.set(
      `login-otp:${profile.email}`,
      JSON.stringify({ otp, otpExpiry, user: { id: user.id, email: user.email, role: user.role } }),
      "EX",
      300
    );

    await sendOtpToEmail({ email: user.email, name: user.name, otp });

    return res.status(200).json({ message: "OTP sent to your email. Please verify to complete Google login." });
  }

  const jwtPayload = { id: user.id, email: user.email, role: user.role };
  const accessToken = generateAccessToken(jwtPayload);
  const refreshToken = generateRefreshToken(jwtPayload);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false, // prod: true + sameSite:'none' with HTTPS
    path: "/api/refresh",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  delete (user as any).password;

  return res.status(200).json({ message: "Google login successful", accessToken, user });
});
