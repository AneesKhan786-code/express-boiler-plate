import { HttpError } from "@/lib/fn-error";
import { asyncWrapper } from "@/lib/fn-wrapper";
import { registerEntity } from "../dto/auth.dto";
import { hash } from "bcryptjs";
import pool from "@/adapters/postgres/postgres.adapter"; 

export const signup = asyncWrapper(async (req, res, next) => {
  const parsed = registerEntity.safeParse(req.body);
  if (!parsed.success) {
    return next(new HttpError("Invalid input", 400));
  }

  const { name, email, password } = parsed.data;

  const existingUser = await pool.query(
    "SELECT id FROM users WHERE email = $1",
    [email]
  );

  if (existingUser.rows.length > 0) {
    return next(new HttpError("Email already exists", 409));
  }


  const hashedPassword = await hash(password, 10);


  const result = await pool.query(
    `INSERT INTO users (name, email, password) 
     VALUES ($1, $2, $3) RETURNING id, name, email`,
    [name, email, hashedPassword]
  );

  const user = result.rows[0];

  const { generateAccessToken, generateRefreshToken } = await import("@/utils/jwt");
  const accessToken = generateAccessToken({ id: user.id, email: user.email });
  const refreshToken = generateRefreshToken({ id: user.id, email: user.email });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false, 
    path: "/api/refresh",
    maxAge: 7 * 24 * 60 * 60 * 1000, 
  });

  res.status(201).json({
    accessToken,
    user,
  });
});
