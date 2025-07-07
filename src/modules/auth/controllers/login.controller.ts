import { asyncWrapper } from "@/lib/fn-wrapper";
import { HttpError } from "@/lib/fn-error";
import { loginEntity } from "../dto/auth.dto";
import { compare } from "bcryptjs";
import pool from "@/adapters/postgres/postgres.adapter";
import { generateAccessToken, generateRefreshToken } from "@/utils/jwt";
import jwt from "jsonwebtoken"; // 👈 for decoding token

export const login = asyncWrapper(async (req, res, next) => {
  const parsed = loginEntity.safeParse(req.body);
  if (!parsed.success) {
    return next(new HttpError("Invalid input", 400));
  }

  const { email, password } = parsed.data;

  const result = await pool.query(
    "SELECT id, name, email, password, role FROM users WHERE email = $1",
    [email]
  );

  if (result.rows.length === 0) {
    return next(new HttpError("User not found", 404));
  }

  const user = result.rows[0];
  console.log("👤 Fetched User:", user); // ✅ confirm role included

  const isMatch = await compare(password, user.password);
  if (!isMatch) {
    return next(new HttpError("Invalid credentials", 401));
  }
  // ✅ JWT payload
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };
  
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // ✅ Decode accessToken to verify inside it
  const decoded = jwt.decode(accessToken);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false, // Set to true in production
    path: "/api/refresh",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  delete user.password;

  res.status(200).json({
    accessToken,
    user,
  });
});
