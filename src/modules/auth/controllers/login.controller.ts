import { Request, Response, NextFunction } from "express";
import { compare } from "bcryptjs";
import { asyncWrapper } from "@/lib/fn-wrapper";
import { HttpError } from "@/lib/fn-error";
import { loginEntity } from "../dto/auth.dto";
import pool from "@/adapters/postgres/postgres.adapter";
import redisClient from "@/adapters/redis/redis.adapter";
import { sendOtpToEmail } from "../../user/services/mail.service";
import { generateOtp } from "@/utils/otp";
import { generateAccessToken, generateRefreshToken } from "@/utils/jwt";

export const login = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const parsed = loginEntity.safeParse(req.body);
  if (!parsed.success) {
    return next(new HttpError("Invalid input", 400));
  }

  const { email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const result = await pool.query(
    "SELECT id, name, email, password, role, verified FROM users WHERE email = $1",
    [normalizedEmail]
  );

  if (result.rows.length === 0) {
    return next(new HttpError("User not found", 404));
  }

  const user = result.rows[0];

  const isMatch = await compare(password, user.password);
  if (!isMatch) {
    return next(new HttpError("Invalid credentials", 401));
  }

  if (!user.verified) {
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 min

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

  delete user.password;

  res.status(200).json({
    accessToken,
    user,
  });
});
