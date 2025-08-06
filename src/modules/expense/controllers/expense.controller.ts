import { Request, Response } from "express";
import { asyncWrapper } from "../../../lib/fn-wrapper";
import { createExpenseDto } from "../dto/expense.dto";
import { db } from "../../../drizzle/db"
import { expenses } from "../../../drizzle/schema/expenses";
import { eq, and, desc } from "drizzle-orm";

//  CREATE Expense
export const createExpense = asyncWrapper(async (req: Request, res: Response) => {
  const parsed = createExpenseDto.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const { amount, description } = parsed.data;
  const userId = (req as any).user.id;

  const [expense] = await db.insert(expenses).values({
    userId,
    amount: amount.toString(),
    description,
  }).returning();

  res.status(201).json({ message: "Expense recorded", expense });
});

//  GET Expenses
export const getExpenses = asyncWrapper(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  const expenseList = await db
    .select()
    .from(expenses)
    .where(
      and(
        eq(expenses.userId, userId),
        eq(expenses.deleted, false)
      )
    )
    .orderBy(desc(expenses.createdAt));

  res.status(200).json({ expenses: expenseList });
});

//  GET Expense by ID
export const getExpenseById = asyncWrapper(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id } = req.params;

  const [expense] = await db
    .select()
    .from(expenses)
    .where(
      and(
        eq(expenses.id, id),
        eq(expenses.userId, userId),
        eq(expenses.deleted, false)
      )
    );

  if (!expense) return res.status(404).json({ error: "Expense not found" });

  res.status(200).json({ expense });
});

//  UPDATE Expense
export const updateExpense = asyncWrapper(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id } = req.params;
  const parsed = createExpenseDto.safeParse(req.body);

  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const { amount, description } = parsed.data;

  const [updatedExpense] = await db
    .update(expenses)
    .set({ amount: amount.toString(), description })
    .where(
      and(
        eq(expenses.id, id),
        eq(expenses.userId, userId),
        eq(expenses.deleted, false)
      )
    )
    .returning();

  if (!updatedExpense) return res.status(404).json({ error: "Expense not found or deleted" });

  res.status(200).json({ message: "Expense updated", updatedExpense });
});

//  DELETE (soft) Expense
export const deleteExpense = asyncWrapper(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id } = req.params;

  const [deletedExpense] = await db
    .update(expenses)
    .set({ deleted: true })
    .where(
      and(
        eq(expenses.id, id),
        eq(expenses.userId, userId),
        eq(expenses.deleted, false)
      )
    )
    .returning();

  if (!deletedExpense) return res.status(404).json({ error: "Expense not found or already deleted" });

  res.status(200).json({ message: "Expense deleted (soft)", deletedExpense });
});
