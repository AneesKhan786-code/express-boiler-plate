import { Request, Response } from "express";
import { asyncWrapper } from "@/lib/fn-wrapper";
import { HttpError } from "@/lib/fn-error";
import { createUserDto } from "../dto/user.dto";
import { hash } from "bcryptjs";
import pool from "@/adapters/postgres/postgres.adapter";

// ✅ Create User - Save into `users`
export const createUser = asyncWrapper(async (req: Request, res: Response, next) => {
  const parsed = createUserDto.safeParse(req.body);
  if (!parsed.success) return next(new HttpError("Invalid input", 400));

  const { name, email, password } = parsed.data;

  const { rowCount } = await pool.query("SELECT 1 FROM users WHERE email = $1", [email]);
  if (rowCount) return next(new HttpError("Email already exists", 409));

  const hashedPassword = await hash(password, 10);

  const {
    rows: [user],
  } = await pool.query(
    `INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email`,
    [name, email, hashedPassword]
  );

  res.status(201).json({ message: "User created successfully", user });
});

// ✅ Get Job & Today's Expense using subqueries from `users`
export const getUserJobAndTodayExpense = asyncWrapper(async (req: Request, res: Response, next) => {
  const userId = (req as any).user.id;
  

  const result = await pool.query(
    `
      SELECT 
        name,
        (SELECT title FROM jobs WHERE user_id = $1 LIMIT 1) AS job_title,
        (
          SELECT json_agg(json_build_object('amount', amount, 'description', description))
          FROM expenses
          WHERE user_id = $1 AND DATE(created_at) = CURRENT_DATE
        ) AS today_expenses
      FROM users
      WHERE id = $1
    `,
    [userId]
  );

 
  res.status(200).json({ data: result.rows[0] });
});
