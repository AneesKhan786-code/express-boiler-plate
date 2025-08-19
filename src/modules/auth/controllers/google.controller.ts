// src/modules/auth/controllers/google.controller.ts
import { Request, Response, NextFunction } from "express";
import { asyncWrapper } from "../../../lib/fn-wrapper";
import { HttpError } from "../../../lib/fn-error";
import { googleLoginDto } from "../dto/google.dto";
import { googleClient } from "../../../utils/google";
import { findOrCreateOrLinkGoogleUser } from "../services/google.service";
import { generateAccessToken, generateRefreshToken } from "../../../utils/jwt";

export const googleLoginController = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const parsed = googleLoginDto.safeParse(req.body);
  if (!parsed.success) return next(new HttpError("Invalid Google token", 400));

  const { token } = parsed.data;

  // Verify id_token
  const ticket = await googleClient.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID!,
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.email || !payload.sub) {
    return next(new HttpError("Google verification failed", 401));
  }

  const profile = {
    googleId: payload.sub,
    email: payload.email.toLowerCase(),
    name: payload.name ?? "Google User",
  };

  const user = await findOrCreateOrLinkGoogleUser(profile);

  const jwtPayload = { id: user.id, email: user.email, role: user.role };
  const accessToken = generateAccessToken(jwtPayload);
  const refreshToken = generateRefreshToken(jwtPayload);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false, // prod: true + sameSite:'none' with HTTPS
    path: "/api/refresh",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  (user as any).password = undefined;

  return res.status(200).json({
    message: "Google login successful",
    accessToken,
    user,
  });
});
