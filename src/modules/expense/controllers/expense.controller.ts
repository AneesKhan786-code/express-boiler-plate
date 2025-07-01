import { Request, Response } from "express";
import { asyncWrapper } from "@/lib/fn-wrapper";
import { createExpenseDto } from "../dto/expense.dto";
import pool from "@/adapters/postgres/postgres.adapter";

export const createExpense = asyncWrapper(async (req: Request, res: Response) => {
  const parsed = createExpenseDto.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const { amount, description } = parsed.data;
  const userId = (req as any).user.id;

  const {
    rows: [expense],
  } = await pool.query(
    `INSERT INTO expenses (user_id, amount, description) VALUES ($1, $2, $3) RETURNING *`,
    [userId, amount, description]
  );

  res.status(201).json({ message: "Expense recorded successfully", expense });
});
