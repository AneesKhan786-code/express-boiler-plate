import { Request, Response } from "express";
import { asyncWrapper } from "@/lib/fn-wrapper";
import { createExpenseDto } from "../dto/expense.dto";
import pool from "@/adapters/postgres/postgres.adapter";

export const createExpense = asyncWrapper(async (req: Request, res: Response) => {
  const parsed = createExpenseDto.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const { amount, description } = parsed.data;
  const userId = (req as any).user.id;

  const { rows: [expense] } = await pool.query(
    `INSERT INTO expenses (user_id, amount, description) VALUES ($1, $2, $3) RETURNING *`,
    [userId, amount, description]
  );

  res.status(201).json({ message: "Expense recorded", expense });
});

export const getExpenses = asyncWrapper(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  const { rows: expenses } = await pool.query(
    `SELECT * FROM expenses WHERE user_id = $1 AND deleted = FALSE ORDER BY created_at DESC`,
    [userId]
  );

  res.status(200).json({ expenses });
});

export const getExpenseById = asyncWrapper(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id } = req.params;

  const { rows: [expense] } = await pool.query(
    `SELECT * FROM expenses WHERE id = $1 AND user_id = $2 AND deleted = FALSE`,
    [id, userId]
  );

  if (!expense) return res.status(404).json({ error: "Expense not found" });

  res.status(200).json({ expense });
});

export const updateExpense = asyncWrapper(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id } = req.params;
  const parsed = createExpenseDto.safeParse(req.body);

  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const { amount, description } = parsed.data;

  const { rows: [updatedExpense] } = await pool.query(
    `UPDATE expenses SET amount = $1, description = $2 
     WHERE id = $3 AND user_id = $4 AND deleted = FALSE RETURNING *`,
    [amount, description, id, userId]
  );

  if (!updatedExpense) return res.status(404).json({ error: "Expense not found or deleted" });

  res.status(200).json({ message: "Expense updated", updatedExpense });
});

export const deleteExpense = asyncWrapper(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id } = req.params;

  const { rows: [deletedExpense] } = await pool.query(
    `UPDATE expenses SET deleted = TRUE 
     WHERE id = $1 AND user_id = $2 AND deleted = FALSE RETURNING *`,
    [id, userId]
  );

  if (!deletedExpense) return res.status(404).json({ error: "Expense not found or already deleted" });

  res.status(200).json({ message: "Expense deleted (soft)", deletedExpense });
});
