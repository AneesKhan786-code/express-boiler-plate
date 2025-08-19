// ✅ Imports
import { Request, Response, NextFunction } from "express";
import { compare } from "bcryptjs";
import { asyncWrapper } from "../../../lib/fn-wrapper";
import { HttpError } from "../../../lib/fn-error";
import { loginEntity } from "../dto/auth.dto";
import redisClient from "../../../adapters/redis/redis.adapter";
import { sendOtpToEmail } from "../../user/services/mail.service";
import { generateOtp } from "@/utils/otp";
import { generateAccessToken, generateRefreshToken } from "../../../utils/jwt";
import { db } from "../../../drizzle/db";
import { users } from "../../../drizzle/schema/users";
import { eq } from "drizzle-orm";

//  Login Controller
export const login = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const parsed = loginEntity.safeParse(req.body);
  if (!parsed.success) {
    return next(new HttpError("Invalid input", 400));
  }

  const { email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  // 🔎 User nikaalo
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail));

  if (result.length === 0) {
    return next(new HttpError("User not found", 404));
  }

  const user = result[0];

  // ⛔ Google-only user ka check
  if (!user.password) {
    return next(new HttpError("Password not set. Please login with Google.", 400));
  }

  // 🔑 Password compare
  const isMatch = await compare(password, user.password);
  if (!isMatch) {
    return next(new HttpError("Invalid credentials", 401));
  }

  // ✅ OTP if not verified
  if (!user.verified) {
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    await redisClient.set(
      `login-otp:${normalizedEmail}`,
      JSON.stringify({
        otp,
        otpExpiry,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      }),
      "EX",
      300
    );

    await sendOtpToEmail({ email: user.email, name: user.name, otp });

    return res.status(200).json({
      message: "OTP sent to your email. Please verify to complete login.",
    });
  }

  // 🎟 JWT Tokens
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

  delete (user as any).password;
  res.status(200).json({
    accessToken,
    user,
  });
});
