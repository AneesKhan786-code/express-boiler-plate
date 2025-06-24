import { asyncWrapper } from "@/lib/fn-wrapper";
import { HttpError } from "@/lib/fn-error";
import { loginEntity } from "../dto/auth.dto";
import { compare } from "bcryptjs";
import pool from "@/adapters/postgres/postgres.adapter"; // ✅ withDb removed
import { generateAccessToken, generateRefreshToken } from "@/utils/jwt";

export const login = asyncWrapper(async (req, res, next) => {
  // ✅ Validate input using Zod
  const parsed = loginEntity.safeParse(req.body);
  if (!parsed.success) {
    return next(new HttpError("Invalid input", 400));
  }

  const { email, password } = parsed.data;

  // ✅ Find user by email
  const result = await pool.query(
    "SELECT id, name, email, password FROM users WHERE email = $1",
    [email]
  );

  if (result.rows.length === 0) {
    return next(new HttpError("User not found", 404));
  }

  const user = result.rows[0];

  // ✅ Check password
  const isMatch = await compare(password, user.password);
  if (!isMatch) {
    return next(new HttpError("Invalid credentials", 401));
  }

  // ✅ Generate tokens
  const accessToken = generateAccessToken({ id: user.id, email: user.email });
  const refreshToken = generateRefreshToken({ id: user.id, email: user.email });

  // ✅ Set refresh token in HTTP-only cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false, // ⚠️ production me true karo
    path: "/api/refresh",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // ✅ Remove password before sending user object
  delete user.password;

  // ✅ Send response
  res.status(200).json({
    accessToken,
    user,
  });
});
