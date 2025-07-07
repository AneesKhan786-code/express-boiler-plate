import { HttpError } from "@/lib/fn-error";
import { asyncWrapper } from "@/lib/fn-wrapper";
import { registerEntity } from "../dto/auth.dto";
import { hash } from "bcryptjs";
import pool from "@/adapters/postgres/postgres.adapter";

export const signup = asyncWrapper(async (req, res, next) => {
  const parsed = registerEntity.safeParse(req.body);
  if (!parsed.success) return next(new HttpError("Invalid input", 400));

  const { name, email, password } = parsed.data;

  const { rowCount } = await pool.query("SELECT 1 FROM users WHERE email = $1", [email]);
  if (rowCount) return next(new HttpError("Email already exists", 409));

  const hashedPassword = await hash(password, 10);

  //Add default role: "user"
  const defaultRole = "user";

  const {
    rows: [user],
  } = await pool.query(
    `INSERT INTO users (name, email, password, role) 
     VALUES ($1, $2, $3, $4) RETURNING id, name, email, role`,
    [name, email, hashedPassword, defaultRole]
  );

  const { generateAccessToken, generateRefreshToken } = await import("@/utils/jwt");

  const accessToken = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  res
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      path: "/api/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .status(201)
    .json({ accessToken, user });
});
